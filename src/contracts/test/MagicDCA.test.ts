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

const WETH_PRICE_FEED = "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419";
const DAI_PRICE_FEED = "0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9";
const UNI_PRICE_FEED = "0x553303d460EE0afB37EdFf9bE42922D8FF63220e";

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
    const DAI = new hre.ethers.Contract(DAI_ADDRESS, ercAbi, signer);
    const UNI = new hre.ethers.Contract(UNI_ADDRESS, ercAbi, signer);

    const usdcBalanceBeforeDCA = await USDC.balanceOf(signer.address);
    const usdcBalanceBeforeFormatted = Number(
      hre.ethers.formatUnits(usdcBalanceBeforeDCA, USDC_DECIMALS)
    );
    console.log("USDC BEFORE Starting MAGIC DCA:", usdcBalanceBeforeFormatted);

    const WETHbalanceBeforeDCA = await WETH.balanceOf(signer.address);
    const DAIBalanceBeforeDCA = await DAI.balanceOf(signer.address);
    const UNIBalanceBeforeDCA = await UNI.balanceOf(signer.address);

    const feeToken = USDC_ADDRESS;
    // const feeToken = "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9";
    const magicDCAFactory = await hre.ethers.getContractFactory("MagicDCA");
    const magicDCA = await magicDCAFactory.deploy(
      GelatoAutomateAddress,
      SwapRouterAddress,
      feeToken
    );
    magicDCA.waitForDeployment();

    const magicDCAAddress = await magicDCA.getAddress();
    console.log("Magic DCA deployed to:", magicDCAAddress);

    // Create DCA tasks
    const newDca = {
      name: "test",
      amount: 50,
      interval: 100000,
      maxCount: 10,
      outputSwaps: [
        { token: WETH_ADDRESS, percentage: 50 },
        { token: DAI_ADDRESS, percentage: 20 },
        { token: UNI_ADDRESS, percentage: 30 },
      ],
    };

    const dcaTask = await magicDCA.createDcaTask(
      newDca.name,
      newDca.amount,
      newDca.interval,
      newDca.maxCount,
      newDca.outputSwaps
    );

    const getDcaTasks = await magicDCA.getDcaTasks();

    const dcaTaskId = getDcaTasks[0][0];
    console.log("DCA task created: ", dcaTaskId);

    // Aprove contract to use USDC
    const approveTx = await USDC.approve(magicDCAAddress, 100);
    approveTx.wait();

    // Approve contract to use WETH
    // const approveWETHTx = await WETH.approve(
    //   magicDCAAddress,
    //   hre.ethers.parseEther("0.2")
    // );
    // await approveWETHTx.wait();

    // Set price feed oracleFor WETH and DAI

    const WETHpriceFeedOracle = await magicDCA.setOracle(
      WETH_ADDRESS,
      WETH_PRICE_FEED
    );

    const DAIpriceFeedOracle = await magicDCA.setOracle(
      DAI_ADDRESS,
      DAI_PRICE_FEED
    );

    const UNIpriceFeedOracle = await magicDCA.setOracle(
      UNI_ADDRESS,
      UNI_PRICE_FEED
    );

    const executer = signers[1];

    // Connect executer to DCA contract
    const newDCA = magicDCA.connect(executer);

    // Execute DCA task
    const executeDcaTask = await newDCA.executeDcaTask(
      signer.address,
      dcaTaskId
    );

    const result = await executeDcaTask.wait();
    console.log(
      `*AC DCA task owner: ${signer.address}, executer: ${
        result?.from ?? "null"
      }`
    );

    const usdcBalanceAfterDCA = await USDC.balanceOf(signer.address);
    const usdcBalanceAfterFormattedDCA = Number(
      hre.ethers.formatUnits(usdcBalanceAfterDCA, USDC_DECIMALS)
    );

    // Validate DCA task executed successfully
    expect(usdcBalanceBeforeDCA).is.greaterThan(usdcBalanceAfterDCA);

    // Check WETH balance
    const WETHbalanceAfterDCA = await WETH.balanceOf(signer.address);
    const WETHbalanceAfterDCAFormatted = Number(
      hre.ethers.formatUnits(WETHbalanceAfterDCA, DAI_DECIMALS)
    );

    // Check DAI balance
    const DAIBalanceAfterDCA = await DAI.balanceOf(signer.address);
    const DAIBalanceAfterDCAFormatted = Number(
      hre.ethers.formatUnits(DAIBalanceAfterDCA, DAI_DECIMALS)
    );

    // Check UNI balance
    const UNIBalanceAfterDCA = await UNI.balanceOf(signer.address);
    const UNIBalanceAfterDCAFormatted = Number(
      hre.ethers.formatUnits(UNIBalanceAfterDCA, DAI_DECIMALS)
    );

    // Validate DCA task executed successfully
    expect(DAIBalanceAfterDCA).is.greaterThan(DAIBalanceBeforeDCA);
    expect(WETHbalanceAfterDCA).is.greaterThan(WETHbalanceBeforeDCA);
    expect(UNIBalanceAfterDCA).is.greaterThan(UNIBalanceBeforeDCA);

    console.log(
      `*AC WETH before: ${WETHbalanceBeforeDCA}, WETH after: ${WETHbalanceAfterDCA}, diff: ${
        WETHbalanceAfterDCA - WETHbalanceBeforeDCA
      }`
    );

    console.log(
      `*AC DAI before: ${DAIBalanceBeforeDCA}, DAI after: ${DAIBalanceAfterDCA}, diff: ${
        DAIBalanceAfterDCA - DAIBalanceBeforeDCA
      }`
    );

    console.log(
      `*AC UNI before: ${UNIBalanceBeforeDCA}, UNI after: ${UNIBalanceAfterDCA}, diff: ${
        UNIBalanceAfterDCA - UNIBalanceBeforeDCA
      }`
    );

    console.log(
      `*AC USDC before: ${usdcBalanceAfterDCA}, USDC after: ${usdcBalanceBeforeDCA}, diff: ${
        usdcBalanceAfterDCA - usdcBalanceBeforeDCA
      }`
    );

    // fetch chainlink price from getChainlinkDataFeedLatestAnswer function in magicDCA contract
    // const chainlinkPrice = await magicDCA.getFormattedPrice(WETH_ADDRESS, 100);
    // console.log("Chainlink price: ", chainlinkPrice);
  });
});
