import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";

const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const DAI_ADDRESS = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
const USDC_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const LINK_ADDRESS = "0x514910771AF9Ca656af840dff83E8264EcF986CA";
const UNI_ADDRESS = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984";

const DAI_DECIMALS = 18;
const USDC_DECIMALS = 6;
const SwapRouterAddress = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
const GelatoAutomateAddress = "0x2A6C106ae13B558BB9E2Ec64Bd2f1f7BEFF3A5E0";

const ercAbi = [
  // Read-Only Functions
  "function balanceOf(address owner) view returns (uint256)",
  // Authenticated Functions
  "function transfer(address to, uint amount) returns (bool)",
  "function deposit() public payable",
  "function approve(address spender, uint256 amount) returns (bool)",
];

// describe("SimpleSwap", function () {
//   it("Should provide a caller with more DAI than they started with after a swap", async function () {
//     /* Deploy the SimpleSwap contract */
//     const simpleSwapFactory = await hre.ethers.getContractFactory("SimpleSwap");
//     const simpleSwap = await simpleSwapFactory.deploy(SwapRouterAddress); // Ensure the contract is deployed
//     simpleSwap.waitForDeployment();
//     console.log("SimpleSwap deployed to:", await simpleSwap.getAddress());

//     let signers = await hre.ethers.getSigners();
//     const signer = signers[0];
//     console.log("Using signer address:", signer.address);

//     /* Connect to WETH and wrap some eth  */
//     const WETH = new hre.ethers.Contract(WETH_ADDRESS, ercAbi, signer);
//     const deposit = await WETH.deposit({
//       value: hre.ethers.parseEther("10"),
//     });
//     await deposit.wait();
//     console.log("WETH deposited");

//     const expandedWETHBalance = await WETH.balanceOf(signer.address);
//     const wethBalanceBefore = Number(
//       hre.ethers.formatUnits(expandedWETHBalance, DAI_DECIMALS)
//     );
//     console.log("WETH balance before swap:", wethBalanceBefore);

//     /* Check Initial DAI Balance */
//     const DAI = new hre.ethers.Contract(DAI_ADDRESS, ercAbi, signer);
//     const expandedDAIBalanceBefore = await DAI.balanceOf(signer.address);
//     const DAIBalanceBefore = Number(
//       hre.ethers.formatUnits(expandedDAIBalanceBefore, DAI_DECIMALS)
//     );
//     console.log("DAI balance before swap:", DAIBalanceBefore);

//     /* Approve the swapper contract to spend WETH for me */
//     const approveTx = await WETH.approve(
//       simpleSwap.getAddress(),
//       hre.ethers.parseEther("1")
//     );
//     await approveTx.wait();
//     console.log("WETH approved for SimpleSwap");

//     /* Execute the swap */
//     const amountIn = hre.ethers.parseEther("0.1");
//     const swapTx = await simpleSwap.swapWETHForDAI(amountIn, {
//       gasLimit: 300000,
//     });
//     await swapTx.wait();
//     console.log("Swap executed");

//     /* Check DAI end balance */
//     const expandedDAIBalanceAfter = await DAI.balanceOf(signer.address);
//     const DAIBalanceAfter = Number(
//       hre.ethers.formatUnits(expandedDAIBalanceAfter, DAI_DECIMALS)
//     );
//     console.log("DAI balance after swap:", DAIBalanceAfter - DAIBalanceBefore);

//     expect(DAIBalanceAfter).is.greaterThan(DAIBalanceBefore);
//   });
// });

describe("MagicDCA", function () {
  this.beforeEach(async function () {
    // Fund signer with some WETH and USDC
    let signers = await hre.ethers.getSigners();
    const signer = signers[0];

    const WETH = new hre.ethers.Contract(WETH_ADDRESS, ercAbi, signer);
    const USDC = new hre.ethers.Contract(USDC_ADDRESS, ercAbi, signer);

    const depositWETH = await WETH.deposit({
      value: hre.ethers.parseEther("100"),
    });
    await depositWETH.wait();

    const simpleSwapFactory = await hre.ethers.getContractFactory("SimpleSwap");
    const simpleSwap = await simpleSwapFactory.deploy(SwapRouterAddress); // Ensure the contract is deployed
    simpleSwap.waitForDeployment();

    /* Approve the swapper contract to spend WETH for me */
    const approveTx = await WETH.approve(
      simpleSwap.getAddress(),
      hre.ethers.parseEther("0.2")
    );
    await approveTx.wait();

    const amountIn = hre.ethers.parseEther("0.2");
    const swapTx = await simpleSwap.swapWETHForDAI(amountIn, {
      gasLimit: 300000,
    });
    await swapTx.wait();

    const usdcBalanceAfter = await USDC.balanceOf(signer.address);
    const usdcBalanceAfterFormatted = Number(
      hre.ethers.formatUnits(usdcBalanceAfter, USDC_DECIMALS)
    );
  });

  it("Create dca tasks and execute and validate swaps", async function () {
    let signers = await hre.ethers.getSigners();
    const signer = signers[0];

    const USDC = new hre.ethers.Contract(USDC_ADDRESS, ercAbi, signer);
    const WETH = new hre.ethers.Contract(WETH_ADDRESS, ercAbi, signer);

    const usdcBalanceAfter = await USDC.balanceOf(signer.address);
    const usdcBalanceAfterFormatted = Number(
      hre.ethers.formatUnits(usdcBalanceAfter, USDC_DECIMALS)
    );

    console.log("USDC BEFORE Starting MAGIC DCA:", usdcBalanceAfterFormatted);

    const magicDCAFactory = await hre.ethers.getContractFactory("MagicDCA");
    const magicDCA = await magicDCAFactory.deploy(
      GelatoAutomateAddress,
      SwapRouterAddress
    );
    magicDCA.waitForDeployment();

    const magicDCAAddress = await magicDCA.getAddress();
    console.log("SimpleSwap deployed to:", magicDCAAddress);

    // Create DCA tasks
    const newDca = {
      name: "test",
      amount: 100,
      interval: 100000,
      maxCount: 10,
      feeToken: "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9",
      outputSwaps: [
        { token: WETH_ADDRESS, percentage: 50 },
        { token: DAI_ADDRESS, percentage: 50 },
      ],
    };

    const dcaTask = await magicDCA.createDcaTask(
      newDca.name,
      newDca.amount,
      newDca.interval,
      newDca.maxCount,
      newDca.feeToken,
      newDca.outputSwaps
    );

    const getDcaTasks = await magicDCA.getDcaTasks();

    const dcaTaskId = getDcaTasks[0][0];
    console.log("DCA task created: ", dcaTaskId);

    // Aprove contract to use USDC
    const approveTx = await USDC.approve(magicDCAAddress, 100);
    approveTx.wait();

    // Approve contract to use WETH
    const approveWETHTx = await WETH.approve(
      magicDCAAddress,
      hre.ethers.parseEther("0.2")
    );
    await approveWETHTx.wait();

    // Execute DCA task
    const executeDcaTask = await magicDCA.executeDcaTask(
      signer.address,
      dcaTaskId
    );

    console.log("DCA task executed: ", executeDcaTask);
  });
});
