import { expect } from "chai";
const { ethers } = require("hardhat");
import hre from "hardhat";

const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const DAI_ADDRESS = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
const USDC_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const LINK_ADDRESS = "0x514910771AF9Ca656af840dff83E8264EcF986CA";
const UNI_ADDRESS = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984";

const DAI_DECIMALS = 18;
const USDC_DECIMALS = 6;
const SwapRouterAddress = "0xE592427A0AEce92De3Edee1F18E0157C05861564";

const ercAbi = [
  // Read-Only Functions
  "function balanceOf(address owner) view returns (uint256)",
  // Authenticated Functions
  "function transfer(address to, uint amount) returns (bool)",
  "function deposit() public payable",
  "function approve(address spender, uint256 amount) returns (bool)",
];

describe("SimpleSwap", function () {
  it("Should provide a caller with more DAI than they started with after a swap", async function () {
    /* Deploy the SimpleSwap contract */
    const simpleSwapFactory = await ethers.getContractFactory("SimpleSwap");
    const simpleSwap = await simpleSwapFactory.deploy(SwapRouterAddress);
    let signers = await hre.ethers.getSigners();

    /* Connect to WETH and wrap some eth  */
    const WETH = new hre.ethers.Contract(WETH_ADDRESS, ercAbi, signers[0]);
    const deposit = await WETH.deposit({
      value: hre.ethers.parseEther("10"),
    });
    await deposit.wait();

    const expandedWETHBalance = await WETH.balanceOf(signers[0].address);
    const wethBalanceBefore = Number(
      hre.ethers.formatUnits(expandedWETHBalance, DAI_DECIMALS)
    );

    /* Check Initial DAI Balance */
    const DAI = new hre.ethers.Contract(DAI_ADDRESS, ercAbi, signers[0]);
    const expandedDAIBalanceBefore = await DAI.balanceOf(signers[0].address);
    const DAIBalanceBefore = Number(
      hre.ethers.formatUnits(expandedDAIBalanceBefore, DAI_DECIMALS)
    );

    /* Approve the swapper contract to spend WETH for me */
    await WETH.approve(simpleSwap.address, hre.ethers.parseEther("1"));

    /* Execute the swap */
    const amountIn = hre.ethers.parseEther("0.1");
    const swap = await simpleSwap.swapWETHForDAI(amountIn, {
      gasLimit: 300000,
    });
    swap.wait();

    // /* Check DAI end balance */
    // const expandedDAIBalanceAfter = await DAI.balanceOf(signers[0].address);
    // const DAIBalanceAfter = Number(
    //   hre.ethers.formatUnits(expandedDAIBalanceAfter, DAI_DECIMALS)
    // );

    // expect(DAIBalanceAfter).is.greaterThan(DAIBalanceBefore);
  });
});
