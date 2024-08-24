// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "./integrations/AutomateTaskCreator.sol";

struct DcaTask {
    uint256 id;
    string name;
    uint256 amount;
    uint128 interval;
    uint256 lastExecuted;
    uint256 count;
    uint256 maxCount;
    address feeToken;
    bytes32 gelatoTaskId; // Store the Gelato task ID directly in the task
}

contract MagicDCA is AutomateTaskCreator {
    mapping(address => DcaTask[]) public dcaTasks;

    uint128 public constant INTERVAL = 3 minutes;

    event DcaTaskCreated(address indexed user, uint256 taskId, string name);
    event DcaTaskUpdated(address indexed user, uint256 taskId, string name);
    event DcaTaskDeleted(address indexed user, uint256 taskId);
    event DcaTaskExecuted(
        address indexed user,
        uint256 taskId,
        uint256 amount,
        address feeToken
    );

    constructor(address payable _automate) AutomateTaskCreator(_automate) {}

    function receive() external payable {}

    function createDcaTask(
        string memory _name,
        uint256 _amount,
        uint128 _interval,
        uint256 _maxCount,
        address _feeToken
    ) external {
        // Generate a random ID based on the block timestamp, the user's address, and the current task length
        uint256 taskId = 1234567890; // TODO: Generate a random ID

        DcaTask memory newTask = DcaTask({
            id: taskId,
            name: _name,
            amount: _amount,
            interval: _interval,
            lastExecuted: block.timestamp,
            count: 0,
            maxCount: _maxCount,
            feeToken: _feeToken,
            gelatoTaskId: bytes32(0) // Initialize as empty, will set after creating Gelato task
        });

        dcaTasks[msg.sender].push(newTask);

        bytes memory execData = abi.encodeCall(
            this.executeDcaTask,
            (newTask.id)
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
        ); // Corresponding to TRIGGER

        bytes32 gelatoTaskId = _createTask(
            dedicatedMsgSender,
            execData,
            moduleData,
            newTask.feeToken
        );

        // Update the Gelato task ID in the new task
        dcaTasks[msg.sender][dcaTasks[msg.sender].length - 1]
            .gelatoTaskId = gelatoTaskId;

        emit DcaTaskCreated(msg.sender, taskId, _name);
    }

    function deleteDcaTask(uint256 _taskId) external {}

    function getDcaTasks() external view returns (DcaTask[] memory) {
        return dcaTasks[msg.sender];
    }

    function executeDcaTask(uint256 _id) external onlyDedicatedMsgSender {
        // uint256 newCount = count + _amount;
        // if (newCount >= MAX_COUNT) {
        //     _cancelTask(taskId);
        //     count = 0;
        // } else {
        //     count += _amount;
        //     lastExecuted = block.timestamp;
        // }

        (uint256 fee, address feeToken) = _getFeeDetails();

        _transfer(fee, feeToken);

        emit DcaTaskExecuted(msg.sender, _id, fee, feeToken);
    }
}
