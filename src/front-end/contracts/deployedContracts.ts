const deployedContracts = {
    DCAScheduler: {
      address: '0x39f53076A29c0D1F5068998791DE70A02CdE9d5a',
      abi: [
        {
          "inputs": [
            {
              "internalType": "address payable",
              "name": "_automate",
              "type": "address"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "constructor"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "target",
              "type": "address"
            }
          ],
          "name": "AddressEmptyCode",
          "type": "error"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "account",
              "type": "address"
            }
          ],
          "name": "AddressInsufficientBalance",
          "type": "error"
        },
        {
          "inputs": [],
          "name": "FailedInnerCall",
          "type": "error"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "token",
              "type": "address"
            }
          ],
          "name": "SafeERC20FailedOperation",
          "type": "error"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "bytes32",
              "name": "taskId",
              "type": "bytes32"
            }
          ],
          "name": "CounterTaskCreated",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "user",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "taskId",
              "type": "uint256"
            },
            {
              "indexed": false,
              "internalType": "string",
              "name": "name",
              "type": "string"
            }
          ],
          "name": "DcaTaskCreated",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "user",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "taskId",
              "type": "uint256"
            }
          ],
          "name": "DcaTaskDeleted",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "user",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "taskId",
              "type": "uint256"
            }
          ],
          "name": "DcaTaskExecuted",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "user",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "taskId",
              "type": "uint256"
            },
            {
              "indexed": false,
              "internalType": "string",
              "name": "name",
              "type": "string"
            }
          ],
          "name": "DcaTaskUpdated",
          "type": "event"
        },
        {
          "inputs": [],
          "name": "INTERVAL",
          "outputs": [
            {
              "internalType": "uint128",
              "name": "",
              "type": "uint128"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "automate",
          "outputs": [
            {
              "internalType": "contract IAutomate",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "string",
              "name": "_name",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "_amount",
              "type": "uint256"
            },
            {
              "internalType": "uint128",
              "name": "_interval",
              "type": "uint128"
            },
            {
              "internalType": "uint256",
              "name": "_maxCount",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "_feeToken",
              "type": "address"
            }
          ],
          "name": "createDcaTask",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "createTask",
          "outputs": [],
          "stateMutability": "payable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "name": "dcaTasks",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "id",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "name",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            },
            {
              "internalType": "uint128",
              "name": "interval",
              "type": "uint128"
            },
            {
              "internalType": "uint256",
              "name": "lastExecuted",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "count",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "maxCount",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "feeToken",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "dedicatedMsgSender",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "_taskId",
              "type": "uint256"
            }
          ],
          "name": "deleteDcaTask",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "_id",
              "type": "uint256"
            }
          ],
          "name": "executeDcaTask",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "gelato1Balance",
          "outputs": [
            {
              "internalType": "contract IGelato1Balance",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "getDcaTasks",
          "outputs": [
            {
              "components": [
                {
                  "internalType": "uint256",
                  "name": "id",
                  "type": "uint256"
                },
                {
                  "internalType": "string",
                  "name": "name",
                  "type": "string"
                },
                {
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                },
                {
                  "internalType": "uint128",
                  "name": "interval",
                  "type": "uint128"
                },
                {
                  "internalType": "uint256",
                  "name": "lastExecuted",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "count",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "maxCount",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "feeToken",
                  "type": "address"
                }
              ],
              "internalType": "struct DcaTask[]",
              "name": "",
              "type": "tuple[]"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "taskId",
          "outputs": [
            {
              "internalType": "bytes32",
              "name": "",
              "type": "bytes32"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "",
              "type": "bytes32"
            }
          ],
          "name": "taskIds",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        }
      ]
    }
} as const;

export default deployedContracts;