const deployedContracts = {
    DCAScheduler: {
      address: '0xD64616714b1E53643E1F97c8cCA235EAC2247BBa',
      abi: [
        {
          "inputs": [
            {
              "internalType": "address payable",
              "name": "_automate",
              "type": "address"
            },
            {
              "internalType": "contract ISwapRouter",
              "name": "_swapRouter",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "_feeToken",
              "type": "address"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "constructor"
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
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            },
            {
              "indexed": false,
              "internalType": "uint128",
              "name": "interval",
              "type": "uint128"
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
            },
            {
              "components": [
                {
                  "internalType": "address",
                  "name": "tokenIn",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "tokenOut",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "amountIn",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "amountOut",
                  "type": "uint256"
                }
              ],
              "indexed": false,
              "internalType": "struct PerformedSwap[]",
              "name": "swaps",
              "type": "tuple[]"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "fee",
              "type": "uint256"
            },
            {
              "indexed": false,
              "internalType": "address",
              "name": "feeToken",
              "type": "address"
            }
          ],
          "name": "DcaTaskExecuted",
          "type": "event"
        },
        {
          "inputs": [],
          "name": "USDC",
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
              "components": [
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                },
                {
                  "internalType": "uint8",
                  "name": "percentage",
                  "type": "uint8"
                }
              ],
              "internalType": "struct OutputSwap[]",
              "name": "_outputSwaps",
              "type": "tuple[]"
            }
          ],
          "name": "createDcaTask",
          "outputs": [],
          "stateMutability": "nonpayable",
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
              "name": "count",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "maxCount",
              "type": "uint256"
            },
            {
              "internalType": "bytes32",
              "name": "gelatoTaskId",
              "type": "bytes32"
            },
            {
              "internalType": "uint256",
              "name": "created",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "lastExecuted",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "active",
              "type": "bool"
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
              "internalType": "address",
              "name": "owner",
              "type": "address"
            },
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
          "name": "feeToken",
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
                  "name": "count",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "maxCount",
                  "type": "uint256"
                },
                {
                  "internalType": "bytes32",
                  "name": "gelatoTaskId",
                  "type": "bytes32"
                },
                {
                  "components": [
                    {
                      "internalType": "address",
                      "name": "token",
                      "type": "address"
                    },
                    {
                      "internalType": "uint8",
                      "name": "percentage",
                      "type": "uint8"
                    }
                  ],
                  "internalType": "struct OutputSwap[]",
                  "name": "outputSwaps",
                  "type": "tuple[]"
                },
                {
                  "internalType": "uint256",
                  "name": "created",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "lastExecuted",
                  "type": "uint256"
                },
                {
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
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
          "inputs": [
            {
              "internalType": "address",
              "name": "token",
              "type": "address"
            }
          ],
          "name": "getLatestPrice",
          "outputs": [
            {
              "internalType": "int256",
              "name": "price",
              "type": "int256"
            },
            {
              "internalType": "uint8",
              "name": "decimals",
              "type": "uint8"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "receive",
          "outputs": [],
          "stateMutability": "payable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "token",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "oracle",
              "type": "address"
            }
          ],
          "name": "setOracle",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "swapRouter",
          "outputs": [
            {
              "internalType": "contract ISwapRouter",
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
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "name": "tokenToOracle",
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
          "name": "userTaskIds",
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