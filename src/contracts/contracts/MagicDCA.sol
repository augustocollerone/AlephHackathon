// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "./integrations/AutomateTaskCreator.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";

struct OutputSwap {
    address token;
    uint8 percentage;
}

struct DcaTask {
    uint256 id;
    string name;
    uint256 amount;
    uint128 interval;
    uint256 count;
    uint256 maxCount;
    address feeToken;
    bytes32 gelatoTaskId;
    OutputSwap[] outputSwaps;
    uint256 created;
    uint256 lastExecuted;
}

contract MagicDCA is AutomateTaskCreator {
    mapping(address => mapping(uint256 => DcaTask)) public dcaTasks;
    mapping(address => uint256[]) public userTaskIds;

    address public constant UNISWAP_V3_ROUTER =
        0xE592427A0AEce92De3Edee1F18E0157C05861564; // Mainnet address
    address public constant USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48; // Mainnet address
    ISwapRouter public immutable swapRouter = ISwapRouter(UNISWAP_V3_ROUTER);

    event DcaTaskCreated(address indexed user, uint256 taskId, string name);
    event DcaTaskDeleted(address indexed user, uint256 taskId);
    event DcaTaskExecuted(address indexed user, uint256 taskId);

    constructor(address payable _automate) AutomateTaskCreator(_automate) {}

    function createDcaTask(
        string memory _name,
        uint256 _amount,
        uint128 _interval,
        uint256 _maxCount,
        address _feeToken,
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

        // Generate a random ID based on the block timestamp and the user's address
        uint256 taskId = uint256(
            keccak256(abi.encodePacked(block.timestamp, msg.sender))
        );

        DcaTask memory newTask = DcaTask({
            id: taskId,
            name: _name,
            amount: _amount,
            interval: _interval,
            count: 0,
            maxCount: _maxCount,
            feeToken: _feeToken,
            gelatoTaskId: bytes32(0), // Initialize as empty, will set after creating Gelato task
            outputSwaps: _outputSwaps,
            created: block.timestamp,
            lastExecuted: block.timestamp
        });

        dcaTasks[msg.sender][taskId] = newTask;
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
            newTask.feeToken
        );

        // Update the Gelato task ID in the new task
        dcaTasks[msg.sender][taskId].gelatoTaskId = gelatoTaskId;

        emit DcaTaskCreated(msg.sender, taskId, _name);
    }

    function deleteDcaTask(uint256 _taskId) external {
        // Check if the task exists
        require(dcaTasks[msg.sender][_taskId].id != 0, "Task does not exist");
        delete dcaTasks[msg.sender][_taskId];

        // Remove the task ID from the user's task ID array
        uint256[] storage taskIds = userTaskIds[msg.sender];
        for (uint256 i = 0; i < taskIds.length; i++) {
            if (taskIds[i] == _taskId) {
                taskIds[i] = taskIds[taskIds.length - 1];
                taskIds.pop();
                break;
            }
        }

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

    function executeDcaTask(
        address owner,
        uint256 _id
    ) external onlyDedicatedMsgSender {
        // Fetch the task
        DcaTask storage task = dcaTasks[owner][_id];

        // Check if the task exists
        require(task.id != 0, "Task does not exist");

        // 1. Move USDC from user wallet to this contract
        TransferHelper.safeTransferFrom(
            USDC,
            msg.sender,
            address(this),
            task.amount
        );

        // 2. Calculate gelato fee (placeholder, replace with actual calculation)
        (uint256 fee, address feeToken) = _getFeeDetails();
        uint256 amountAfterFee = task.amount - fee;

        // 3. Approve USDC from this contract to Swap router - minus gelato fee
        TransferHelper.safeApprove(USDC, address(swapRouter), amountAfterFee);

        // 4. Loop through output swaps
        for (uint256 i = 0; i < task.outputSwaps.length; i++) {
            OutputSwap memory outputSwap = task.outputSwaps[i];
            uint256 amountIn = (amountAfterFee * outputSwap.percentage) / 100;

            // 4.a: Fetch price from oracle (if required)
            // Placeholder for fetching price from oracle

            // 4.b: Perform Uniswap Swap
            ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
                .ExactInputSingleParams({
                    tokenIn: USDC,
                    tokenOut: outputSwap.token,
                    fee: 3000,
                    recipient: msg.sender,
                    deadline: block.timestamp,
                    amountIn: amountIn,
                    amountOutMinimum: 0,
                    sqrtPriceLimitX96: 0
                });

            // Execute the swap
            swapRouter.exactInputSingle(params);
        }

        // 5. Pay for gelato fee (if applicable)
        _transfer(fee, feeToken);

        // Update the lastExecuted timestamp
        task.lastExecuted = block.timestamp;

        emit DcaTaskExecuted(owner, _id);
    }
}
