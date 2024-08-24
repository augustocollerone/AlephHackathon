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
    bytes32 gelatoTaskId;
}

contract MagicDCA is AutomateTaskCreator {
    mapping(address => mapping(uint256 => DcaTask)) public dcaTasks;

    event DcaTaskCreated(address indexed user, uint256 taskId, string name);
    event DcaTaskDeleted(address indexed user, uint256 taskId);
    event DcaTaskExecuted(address indexed user, uint256 taskId);

    constructor(address payable _automate) AutomateTaskCreator(_automate) {}

    function receive() external payable {}

    function createDcaTask(
        string memory _name,
        uint256 _amount,
        uint128 _interval,
        uint256 _maxCount,
        address _feeToken
    ) external {
        // Generate a random ID based on the block timestamp and the user's address
        uint256 taskId = uint256(
            keccak256(abi.encodePacked(block.timestamp, msg.sender))
        );

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

        dcaTasks[msg.sender][taskId] = newTask;

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
        // TODO: Check this require
        require(dcaTasks[msg.sender][_taskId].id != 0, "Task does not exist");
        delete dcaTasks[msg.sender][_taskId];
        emit DcaTaskDeleted(msg.sender, _taskId);
    }

    function getDcaTasks() external view returns (DcaTask[] memory) {
        return dcaTasks[msg.sender];
    }

    function executeDcaTask(
        address owner,
        uint256 _id
    ) external onlyDedicatedMsgSender {
        // Fetch the task
        DcaTask storage task = dcaTasks[owner][_id];

        // TODO: Check this require
        require(task.id != 0, "Task does not exist");

        (uint256 fee, address feeToken) = _getFeeDetails();
        _transfer(fee, feeToken);

        emit DcaTaskExecuted(owner, _id);
    }
}
