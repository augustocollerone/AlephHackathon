// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "./integrations/AutomateTaskCreator.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

import "hardhat/console.sol";

struct OutputSwap {
    address token;
    uint8 percentage;
}

struct PerformedSwap {
    address tokenIn;
    address tokenOut;
    uint256 amountIn;
    uint256 amountOut;
}

struct DcaTask {
    uint256 id;
    string name;
    uint256 amount;
    uint128 interval;
    uint256 count;
    uint256 maxCount;
    bytes32 gelatoTaskId;
    OutputSwap[] outputSwaps;
    uint256 created;
    uint256 lastExecuted;
    bool active;
}

contract MagicDCA is AutomateTaskCreator {
    mapping(address => mapping(uint256 => DcaTask)) public dcaTasks;
    mapping(address => uint256[]) public userTaskIds;

    ISwapRouter public immutable swapRouter;

    address public constant USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48; // Mainnet address
    address public immutable feeToken;

    // Mapping from token address to Chainlink oracle address
    mapping(address => address) public tokenToOracle;

    event DcaTaskCreated(
        address indexed user,
        uint256 taskId,
        string name,
        uint256 amount,
        uint128 interval
    );
    event DcaTaskDeleted(address indexed user, uint256 taskId);
    event DcaTaskExecuted(
        address indexed user,
        uint256 taskId,
        PerformedSwap[] swaps,
        uint256 fee,
        address feeToken
    );

    constructor(
        address payable _automate,
        ISwapRouter _swapRouter,
        address _feeToken
    ) AutomateTaskCreator(_automate) {
        swapRouter = _swapRouter;
        feeToken = _feeToken;
    }

    // TODO: Delete this
    function receive() external payable {}

    function setOracle(address token, address oracle) public {
        // Set the oracle address for a specific token
        tokenToOracle[token] = oracle;
    }

    function getLatestPrice(
        address token
    ) public view returns (int price, uint8 decimals) {
        address oracleAddress = tokenToOracle[token];
        require(oracleAddress != address(0), "Oracle not set for this token");

        // TODO: also check that price feed is not older than 10 minutes
        AggregatorV3Interface priceFeed = AggregatorV3Interface(oracleAddress);
        (, price, , , ) = priceFeed.latestRoundData();
        decimals = priceFeed.decimals();
        return (price, decimals);
    }

    function createDcaTask(
        string memory _name,
        uint256 _amount,
        uint128 _interval,
        uint256 _maxCount,
        OutputSwap[] memory _outputSwaps
    ) external {
        uint256 totalPercentage = 0;
        for (uint256 i = 0; i < _outputSwaps.length; i++) {
            require(
                _outputSwaps[i].percentage > 0 &&
                    _outputSwaps[i].percentage <= 100,
                "Percentage must be between 1 and 100"
            );
            totalPercentage += _outputSwaps[i].percentage;
        }
        require(totalPercentage == 100, "Total percentage must be 100");
        require(_maxCount > 0, "Max count must be greater than 0");
        require(_interval > 0, "Interval must be greater than 0");
        require(_amount > 0, "Amount must be greater than 0");

        // Generate a random ID based on the block timestamp and the user's address
        uint256 taskId = uint256(
            keccak256(abi.encodePacked(block.timestamp, msg.sender))
        );

        // Create a new task
        DcaTask storage newTask = dcaTasks[msg.sender][taskId];
        newTask.id = taskId;
        newTask.name = _name;
        newTask.amount = _amount;
        newTask.interval = _interval;
        newTask.count = 0;
        newTask.maxCount = _maxCount;
        newTask.gelatoTaskId = bytes32(0); // Initialize as empty, will set after creating Gelato task
        newTask.created = block.timestamp;
        newTask.lastExecuted = block.timestamp;

        // Copy the outputSwaps array
        for (uint256 i = 0; i < _outputSwaps.length; i++) {
            newTask.outputSwaps.push(_outputSwaps[i]);
        }

        userTaskIds[msg.sender].push(taskId);

        bytes memory execData = abi.encodeCall(
            this.executeDcaTask,
            (msg.sender, newTask.id)
        );

        ModuleData memory moduleData = ModuleData({
            modules: new Module[](2),
            args: new bytes[](2)
        });
        // Ensure that the modules are in ascending order by their enum value
        moduleData.modules[0] = Module.PROXY; // PROXY should come first
        moduleData.modules[1] = Module.TRIGGER; // TRIGGER should come second

        moduleData.args[0] = _proxyModuleArg(); // Corresponding to PROXY
        moduleData.args[1] = _timeTriggerModuleArg(
            uint128(block.timestamp),
            _interval
        );

        bytes32 gelatoTaskId = _createTask(
            address(this),
            execData,
            moduleData,
            feeToken
        );

        // Update the Gelato task ID in the new task
        newTask.gelatoTaskId = gelatoTaskId;

        emit DcaTaskCreated(msg.sender, taskId, _name, _amount, _interval);
    }

    function deleteDcaTask(uint256 _taskId) external {
        // Fetch the task
        DcaTask storage task = dcaTasks[msg.sender][_taskId];

        // Check if the task exists
        require(task.id != 0, "Task does not exist");

        // Update the active status
        task.active = false;

        // Cancel the task
        _cancelTask(task.gelatoTaskId);

        emit DcaTaskDeleted(msg.sender, _taskId);
    }

    function getDcaTasks() external view returns (DcaTask[] memory) {
        uint256[] storage taskIds = userTaskIds[msg.sender];
        DcaTask[] memory tasks = new DcaTask[](taskIds.length);
        for (uint256 i = 0; i < taskIds.length; i++) {
            tasks[i] = dcaTasks[msg.sender][taskIds[i]];
        }
        return tasks;
    }

    function executeDcaTask(address owner, uint256 _id) external {
        // TODO: Uncomment this
        // ) external onlyDedicatedMsgSender {

        // Fetch the task
        DcaTask storage task = dcaTasks[owner][_id];

        // Check if the task exists
        require(task.id != 0, "Task does not exist");

        require(
            IERC20(USDC).allowance(owner, address(this)) >= task.amount,
            "Insufficient allowance for USDC"
        );

        // Check balance
        require(
            IERC20(USDC).balanceOf(owner) >= task.amount,
            "Insufficient USDC balance"
        );

        // Update the lastExecuted timestamp and count
        task.lastExecuted = block.timestamp;
        task.count += 1;

        if (task.count >= task.maxCount) {
            _cancelTask(task.gelatoTaskId);
        }

        // Move USDC from user wallet to this contract
        TransferHelper.safeTransferFrom(
            USDC,
            owner,
            address(this),
            task.amount
        );

        // Calculate gelato fee
        (uint256 taskFee, address taskFeeToken) = _getFeeDetails();

        // Check if fee token is USDC, if not, convert to USDC
        uint256 amountAfterFee = task.amount - taskFee;

        TransferHelper.safeApprove(USDC, address(swapRouter), amountAfterFee);
        // Approve USDC from this contract to Swap router - minus gelato fee

        // Create performed swaps array
        PerformedSwap[] memory performedSwaps = new PerformedSwap[](
            task.outputSwaps.length
        );

        // Loop through output swaps
        for (uint256 i = 0; i < task.outputSwaps.length; i++) {
            OutputSwap memory outputSwap = task.outputSwaps[i];
            uint256 amountIn = (amountAfterFee * outputSwap.percentage) / 100;

            // Fetch price from oracle
            (int price, uint8 decimals) = getLatestPrice(outputSwap.token);
            int minOutput = (int(amountIn) * price) / int(10 ** decimals);

            // 4.b: Build Uniswap Swap
            ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
                .ExactInputSingleParams({
                    tokenIn: USDC,
                    tokenOut: outputSwap.token,
                    fee: 3000,
                    recipient: owner,
                    deadline: block.timestamp,
                    amountIn: amountIn,
                    amountOutMinimum: uint256(minOutput),
                    sqrtPriceLimitX96: 0
                });

            // Execute the swap
            uint256 amountOut = swapRouter.exactInputSingle(params);

            // Update the performed swaps array
            performedSwaps[i] = PerformedSwap({
                tokenIn: USDC,
                tokenOut: outputSwap.token,
                amountIn: amountIn,
                amountOut: amountOut
            });
        }
        // 5. Pay for gelato fee (if applicable)
        // TODO: Uncomment this
        // _transfer(fee, feeToken);

        emit DcaTaskExecuted(owner, _id, performedSwaps, taskFee, taskFeeToken);
    }
}
