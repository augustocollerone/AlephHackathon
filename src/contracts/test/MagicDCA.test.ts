import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";

const UNI_ADDRESS = process.env.UNI_ADDRESS ?? "";
const UNI_PRICE_FEED = process.env.UNI_PRICE_FEED ?? "";

const DAI_DECIMALS = 18;
const USDC_DECIMALS = 6;

const WETH_ADDRESS: string = process.env.WETH_ADDRESS ?? "";
const DAI_ADDRESS: string = process.env.DAI_ADDRESS ?? "";
const USDC_ADDRESS: string = process.env.USDC_ADDRESS ?? "";
const WBTC_ADDRESS: string = process.env.WBTC_ADDRESS ?? "";
const LINK_ADDRESS: string = process.env.LINK_ADDRESS ?? "";
const ARB_ADDRESS: string = process.env.ARB_ADDRESS ?? "";

const WETH_PRICE_FEED: string = process.env.WETH_PRICE_FEED ?? "";
const DAI_PRICE_FEED: string = process.env.DAI_PRICE_FEED ?? "";
const WBTC_PRICE_FEED: string = process.env.WBTC_PRICE_FEED ?? "";
const LINK_PRICE_FEED: string = process.env.LINK_PRICE_FEED ?? "";
const ARB_PRICE_FEED: string = process.env.ARB_PRICE_FEED ?? "";

const GELATO_AUTOMATE: string = process.env.GELATO_AUTOMATE ?? "";
const UNISWAP_ROUTER: string = process.env.UNISWAP_ROUTER ?? "";

const GELATO_PAYMENT_TOKEN: string = process.env.GELATO_PAYMENT_TOKEN ?? "";

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
    const simpleSwap = await simpleSwapFactory.deploy(
      UNISWAP_ROUTER,
      DAI_ADDRESS,
      WETH_ADDRESS,
      USDC_ADDRESS
    ); // Ensure the contract is deployed
    simpleSwap.waitForDeployment();

    /* Approve the swapper contract to spend WETH for me */
    const approveTx = await WETH.approve(
      simpleSwap.getAddress(),
      hre.ethers.parseEther("0.2")
    );
    await approveTx.wait();

    const amountIn = hre.ethers.parseEther("0.2");
    const swapTx = await simpleSwap.swapWETHForUSDC(amountIn, {
      gasLimit: 300000,
    });
    await swapTx.wait();

    const usdcBalanceAfter = await USDC.balanceOf(signer.address);
    const usdcBalanceAfterFormatted = Number(
      hre.ethers.formatUnits(usdcBalanceAfter, USDC_DECIMALS)
    );
  });

  it("Should airdrop", async function () {
    let signers = await hre.ethers.getSigners();

    const brianWallet = "0xD4a581702810Efe92490748a299bD10dbA98bEbd";

    const signer = signers[0];
    const USDC = new hre.ethers.Contract(USDC_ADDRESS, ercAbi, signer);
    const txn = await signer.sendTransaction({
      to: brianWallet,
      value: hre.ethers.parseEther("1"),
    });
    txn.wait();

    const usdcTransferToBrian = await USDC.transfer(
      brianWallet,
      hre.ethers.parseUnits("100", USDC_DECIMALS)
    );
    const result = await usdcTransferToBrian.wait();

    const DAI = new hre.ethers.Contract(DAI_ADDRESS, ercAbi, signer);

    const UNI = new hre.ethers.Contract(UNI_ADDRESS, ercAbi, signer);
    const DAIBalanceBeforeDCA = await DAI.balanceOf(brianWallet);
    const WETH = new hre.ethers.Contract(WETH_ADDRESS, ercAbi, signer);
    const WETHbalanceBeforeDCA = await WETH.balanceOf(signer.address);
    const UNIBalanceBeforeDCA = await UNI.balanceOf(brianWallet);

    console.log(`*AC WETH before: ${WETHbalanceBeforeDCA}`);

    console.log(`*AC DAI before: ${DAIBalanceBeforeDCA}`);

    console.log(`*AC UNI before: ${UNIBalanceBeforeDCA}`);
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

    const magicDCAFactory = await hre.ethers.getContractFactory("MagicDCA");
    const magicDCA = await magicDCAFactory.deploy(
      GELATO_AUTOMATE,
      UNISWAP_ROUTER,
      GELATO_PAYMENT_TOKEN,
      USDC_ADDRESS
    );
    magicDCA.waitForDeployment();

    const magicDCAAddress = await magicDCA.getAddress();
    console.log("Magic DCA deployed to:", magicDCAAddress);

    // Create DCA tasks
    const newDca = {
      name: "test",
      amount: 20000000,
      interval: 2000,
      maxCount: 10,
      outputSwaps: [
        { token: WETH_ADDRESS, percentage: 25 },
        // { token: WBTC_ADDRESS, percentage: 25 },
        { token: LINK_ADDRESS, percentage: 50 },
        { token: ARB_ADDRESS, percentage: 25 },
        // { token: DAI_ADDRESS, percentage: 50 },
        // { token: UNI_ADDRESS, percentage: 50 },
      ],
    };

    // Aprove contract to use USDC
    const approveTx = await USDC.approve(magicDCAAddress, usdcBalanceBeforeDCA);
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

    const WBTCpriceFeedOracle = await magicDCA.setOracle(
      WBTC_ADDRESS,
      WBTC_PRICE_FEED
    );

    const LINKpriceFeedOracle = await magicDCA.setOracle(
      LINK_ADDRESS,
      LINK_PRICE_FEED
    );

    const ARBpriceFeedOracle = await magicDCA.setOracle(
      ARB_ADDRESS,
      ARB_PRICE_FEED
    );

    const dcaTask = await magicDCA.createDcaTask(
      newDca.name,
      newDca.amount,
      newDca.interval,
      newDca.maxCount,
      newDca.outputSwaps
    );

    const creationResult = await dcaTask.wait();
    const taskCreated = findEventArgs(creationResult?.logs, "DcaTaskExecuted");
    // Loop through logs and find DcaTaskExecuted event. Match the addreses with DAI, WETH and UNI. Validate the percentages and console log the exact exchange rates
    taskCreated[2].forEach((swap) => {
      console.log("TokenIn: ", swap.tokenIn);
      console.log("TokenOut: ", swap.tokenOut);
      console.log("AmountIn: ", swap.amountIn);
      console.log("AmountOut: ", swap.amountOut);
      console.log("Exchange Rate: ", swap.tokenIn / swap.tokenOut);
    });

    const getDcaTasks = await magicDCA.getDcaTasks();

    const dcaTaskId = getDcaTasks[0][0];
    console.log("DCA task created: ", dcaTaskId);

    const dedicatedMessageSigner = await magicDCA.dedicatedMsgSender();

    //  impersonating dedicated sender's account
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [dedicatedMessageSigner],
    });

    const txn = await signer.sendTransaction({
      to: dedicatedMessageSigner,
      value: hre.ethers.parseEther("1"),
    });
    txn.wait();

    const empersonatedExecuter = await hre.ethers.getSigner(
      dedicatedMessageSigner
    );

    // Connect executer to DCA contract
    const newDCA = magicDCA.connect(empersonatedExecuter);

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
      `*AC USDC before: ${usdcBalanceBeforeDCA}, USDC after: ${usdcBalanceAfterDCA}, diff: ${
        usdcBalanceAfterDCA - usdcBalanceBeforeDCA
      }`
    );

    function findEventArgs(logs, eventName) {
      let _event = null;

      for (const event of logs) {
        if (event.fragment && event.fragment.name === eventName) {
          _event = event.args;
        }
      }
      return _event;
    }

    // const event = findEventArgs(result?.logs, "DcaTaskExecuted");
    // // Loop through logs and find DcaTaskExecuted event. Match the addreses with DAI, WETH and UNI. Validate the percentages and console log the exact exchange rates
    // event[2].forEach((swap) => {
    //   console.log("TokenIn: ", swap.tokenIn);
    //   console.log("TokenOut: ", swap.tokenOut);
    //   console.log("AmountIn: ", swap.amountIn);
    //   console.log("AmountOut: ", swap.amountOut);
    //   console.log("Exchange Rate: ", swap.tokenIn / swap.tokenOut);
    // });
  });

  it("Should add a new task to existing contract", async function () {
    const constractAddress = "0x1c9788c5BB16EC5E449878fAe761206dfc3A6fEC";

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

    const magicDCA = await hre.ethers.getContractAt(
      "MagicDCA",
      constractAddress
    );
    magicDCA.waitForDeployment();

    const magicDCAAddress = await magicDCA.getAddress();
    console.log("Magic DCA deployed to:", magicDCAAddress);

    // Create DCA tasks
    const newDca = {
      name: "test",
      amount: 20000000,
      interval: 2000,
      maxCount: 1,
      outputSwaps: [
        { token: WETH_ADDRESS, percentage: 25 },
        // { token: WBTC_ADDRESS, percentage: 25 },
        { token: LINK_ADDRESS, percentage: 50 },
        { token: ARB_ADDRESS, percentage: 25 },
        // { token: DAI_ADDRESS, percentage: 50 },
        // { token: UNI_ADDRESS, percentage: 50 },
      ],
    };

    // Aprove contract to use USDC
    const approveTx = await USDC.approve(magicDCAAddress, usdcBalanceBeforeDCA);
    approveTx.wait();

    // Approve contract to use WETH
    // const approveWETHTx = await WETH.approve(
    //   magicDCAAddress,
    //   hre.ethers.parseEther("0.2")
    // );
    // await approveWETHTx.wait();

    // Set price feed oracleFor WETH and DAI

    const dcaTask = await magicDCA.createDcaTask(
      newDca.name,
      newDca.amount,
      newDca.interval,
      newDca.maxCount,
      newDca.outputSwaps
    );
  });
});
