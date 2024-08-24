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
}

contract MagicDCA is AutomateTaskCreator {
    // Create a mapping nest of multiple tasksIds for each address
    mapping(address => DcaTask[]) public dcaTasks;
    mapping(bytes32 => uint256) public taskIds;

    bytes32 public taskId;

    event CounterTaskCreated(bytes32 taskId);

    uint128 public constant INTERVAL = 3 minutes;

    event DcaTaskCreated(address indexed user, uint256 taskId, string name);
    event DcaTaskUpdated(address indexed user, uint256 taskId, string name);
    event DcaTaskDeleted(address indexed user, uint256 taskId);
    event DcaTaskExecuted(address indexed user, uint256 taskId);

    constructor(address payable _automate) AutomateTaskCreator(_automate) {}

    function createTask() external payable {
        require(taskId == bytes32(""), "Already started task");

        bytes memory execData = abi.encodeCall(this.executeDcaTask, (1));

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
            INTERVAL
        ); // Corresponding to TRIGGER

        bytes32 id = _createTask(address(this), execData, moduleData, ETH);

        taskId = id;
        emit CounterTaskCreated(id);
    }

    function createDcaTask(
        string memory _name,
        uint256 _amount,
        uint128 _interval,
        uint256 _maxCount,
        address _feeToken
    ) external {
        DcaTask memory newTask = DcaTask({
            id: _id,
            name: _name,
            amount: _amount,
            interval: _interval,
            lastExecuted: block.timestamp,
            count: 0,
            maxCount: _maxCount,
            feeToken: _feeToken
        });

        dcaTasks[msg.sender].push(newTask);

        // Create new id
        uint256 newId = dcaTasks[msg.sender].length - 1;

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
            INTERVAL
        ); // Corresponding to TRIGGER

        bytes32 gelatoTaskId = _createTask(
            dedicatedMsgSender,
            execData,
            moduleData,
            newTask.feeToken
        );

        taskIds[gelatoTaskId] = newTask.id;

        emit DcaTaskCreated(msg.sender, dcaTasks[msg.sender].length - 1, _name);
    }

    function deleteDcaTask(uint256 _taskId) external {
        require(_taskId < dcaTasks[msg.sender].length, "Invalid task ID");

        uint256 lastTaskId = dcaTasks[msg.sender].length - 1;

        // If the task to be deleted is not the last one, replace it with the last task
        if (_taskId != lastTaskId) {
            dcaTasks[msg.sender][_taskId] = dcaTasks[msg.sender][lastTaskId];
        }

        dcaTasks[msg.sender].pop(); // Remove the last element

        emit DcaTaskDeleted(msg.sender, _taskId);
    }

    function getDcaTasks() external view returns (DcaTask[] memory) {
        return dcaTasks[msg.sender];
    }

    function executeDcaTask(uint256 _id) public onlyDedicatedMsgSender {
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

        emit DcaTaskExecuted(msg.sender, _id);
    }
}
