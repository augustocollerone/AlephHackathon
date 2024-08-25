// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.24;
pragma abicoder v2;

import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";

import "hardhat/console.sol";

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

contract SimpleSwap {
    ISwapRouter public immutable swapRouter;
    address public immutable DAI;
    address public immutable WETH9;
    address public immutable USDC;

    uint24 public constant feeTier = 3000;

    constructor(
        ISwapRouter _swapRouter,
        address _DAI,
        address _WETH9,
        address _USDC
    ) {
        swapRouter = _swapRouter;
        DAI = _DAI;
        WETH9 = _WETH9;
        USDC = _USDC;
    }

    function swapWETHForDAI(
        uint amountIn
    ) external returns (uint256 amountOut) {
        // Transfer the specified amount of WETH9 to this contract.
        TransferHelper.safeTransferFrom(
            WETH9,
            msg.sender,
            address(this),
            amountIn
        );
        // Approve the router to spend WETH9.
        TransferHelper.safeApprove(WETH9, address(swapRouter), amountIn);
        // Create the params that will be used to execute the swap
        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams({
                tokenIn: WETH9,
                tokenOut: DAI,
                fee: feeTier,
                recipient: msg.sender,
                deadline: block.timestamp,
                amountIn: amountIn,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            });
        // The call to `exactInputSingle` executes the swap.
        amountOut = swapRouter.exactInputSingle(params);
        return amountOut;
    }

    function swapWETHForUSDC(
        uint amountIn
    ) external returns (uint256 amountOut) {
        // Transfer the specified amount of WETH9 to this contract.
        TransferHelper.safeTransferFrom(
            WETH9,
            msg.sender,
            address(this),
            amountIn
        );
        // Approve the router to spend WETH9.
        TransferHelper.safeApprove(WETH9, address(swapRouter), amountIn);
        // Create the params that will be used to execute the swap
        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams({
                tokenIn: WETH9,
                tokenOut: USDC,
                fee: feeTier,
                recipient: msg.sender,
                deadline: block.timestamp,
                amountIn: amountIn,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            });
        // The call to `exactInputSingle` executes the swap.
        amountOut = swapRouter.exactInputSingle(params);
        return amountOut;
    }

    function executeMultiSwap(
        uint256 amount,
        OutputSwap[] memory outputSwaps
    ) external {
        // 1. Move USDC from user wallet to this contract
        TransferHelper.safeTransferFrom(
            USDC,
            msg.sender,
            address(this),
            amount
        );

        // 2. Calculate gelato fee (placeholder, replace with actual calculation)
        uint256 gelatoFee = 0; // Replace with actual fee calculation
        uint256 amountAfterFee = amount - gelatoFee;

        // 3. Approve USDC from this contract to Swap router - minus gelato fee
        TransferHelper.safeApprove(USDC, address(swapRouter), amountAfterFee);

        // 4. Loop through output swaps
        for (uint256 i = 0; i < outputSwaps.length; i++) {
            OutputSwap memory outputSwap = outputSwaps[i];
            uint256 amountIn = (amountAfterFee * outputSwap.percentage) / 100;

            // 4.a: Fetch price from oracle (if required)
            // Placeholder for fetching price from oracle

            // 4.b: Perform Uniswap Swap
            ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
                .ExactInputSingleParams({
                    tokenIn: USDC,
                    tokenOut: outputSwap.token,
                    fee: feeTier,
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
    }
}
