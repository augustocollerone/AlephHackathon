import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const WETH_ADDRESS: string = process.env.WETH_ADDRESS ?? "";
const DAI_ADDRESS: string = process.env.DAI_ADDRESS ?? "";
const USDC_ADDRESS: string = process.env.USDC_ADDRESS ?? "";

const WETH_PRICE_FEED: string = process.env.WETH_PRICE_FEED ?? "";
const DAI_PRICE_FEED: string = process.env.DAI_PRICE_FEED ?? "";

const GELATO_AUTOMATE: string = process.env.GELATO_AUTOMATE ?? "";
const UNISWAP_ROUTER: string = process.env.UNISWAP_ROUTER ?? "";

const GELATO_PAYMENT_TOKEN: string = process.env.GELATO_PAYMENT_TOKEN ?? "";

const MagicDCAModule = buildModule("MagicDCAModule2", (m) => {
  const testMagicDCA1 = m.contract(
    "MagicDCA",
    [GELATO_AUTOMATE, UNISWAP_ROUTER, GELATO_PAYMENT_TOKEN, USDC_ADDRESS],
    {
      id: "testMagicDCA1",
    }
  );

  const newDca = {
    name: "Module Test DCA",
    amount: 1,
    interval: 60000,
    maxCount: 2,
    outputSwaps: [
      { token: WETH_ADDRESS, percentage: 50 },
      { token: DAI_ADDRESS, percentage: 50 },
    ],
  };

  // Fund contract
  // m.call(testMagicDCA1, "receive", [], {
  //   value: 3_000_000_000_000_000n, // 1gwei
  // });

  m.call(testMagicDCA1, "setOracle", [WETH_ADDRESS, WETH_PRICE_FEED], {
    id: "setOracleWETH",
  });
  m.call(testMagicDCA1, "setOracle", [DAI_ADDRESS, DAI_PRICE_FEED], {
    id: "setOracleDAI",
  });

  const dcaTask = m.call(testMagicDCA1, "createDcaTask", [
    newDca.name,
    newDca.amount,
    newDca.interval,
    newDca.maxCount,
    newDca.outputSwaps,
  ]);

  // Approve contract to use feeToken
  const usdcContract = m.contractAt("IERC20", USDC_ADDRESS);
  m.call(usdcContract, "approve", [testMagicDCA1, 3]);

  const dcaTask2 = m.call(
    testMagicDCA1,
    "createDcaTask",
    [
      newDca.name,
      newDca.amount,
      newDca.interval,
      newDca.maxCount,
      newDca.outputSwaps,
    ],
    { id: "secondDcaTask" }
  );

  const dcaTask3 = m.call(
    testMagicDCA1,
    "createDcaTask",
    [
      newDca.name,
      newDca.amount,
      newDca.interval,
      newDca.maxCount,
      newDca.outputSwaps,
    ],
    { id: "thirdDcaTask" }
  );

  const dcaTask4 = m.call(
    testMagicDCA1,
    "createDcaTask",
    [
      newDca.name,
      newDca.amount,
      newDca.interval,
      newDca.maxCount,
      newDca.outputSwaps,
    ],
    { id: "fourthDcaTask" }
  );
  const dcaTask5 = m.call(
    testMagicDCA1,
    "createDcaTask",
    [
      newDca.name,
      newDca.amount,
      newDca.interval,
      newDca.maxCount,
      newDca.outputSwaps,
    ],
    { id: "fifthDcaTask" }
  );
  const dcaTask6 = m.call(
    testMagicDCA1,
    "createDcaTask",
    [
      newDca.name,
      newDca.amount,
      newDca.interval,
      newDca.maxCount,
      newDca.outputSwaps,
    ],
    { id: "sixthDcaTask" }
  );
  const dcaTask7 = m.call(
    testMagicDCA1,
    "createDcaTask",
    [
      newDca.name,
      newDca.amount,
      newDca.interval,
      newDca.maxCount,
      newDca.outputSwaps,
    ],
    { id: "seventhDcaTask" }
  );
  const dcaTask8 = m.call(
    testMagicDCA1,
    "createDcaTask",
    [
      newDca.name,
      newDca.amount,
      newDca.interval,
      newDca.maxCount,
      newDca.outputSwaps,
    ],
    { id: "eithDcaTask" }
  );
  const dcaTask9 = m.call(
    testMagicDCA1,
    "createDcaTask",
    [
      newDca.name,
      newDca.amount,
      newDca.interval,
      newDca.maxCount,
      newDca.outputSwaps,
    ],
    { id: "ninthDcaTask" }
  );
  const dcaTask10 = m.call(
    testMagicDCA1,
    "createDcaTask",
    [
      newDca.name,
      newDca.amount,
      newDca.interval,
      newDca.maxCount,
      newDca.outputSwaps,
    ],
    { id: "tenthDcaTask" }
  );
  const dcaTask11 = m.call(
    testMagicDCA1,
    "createDcaTask",
    [
      newDca.name,
      newDca.amount,
      newDca.interval,
      newDca.maxCount,
      newDca.outputSwaps,
    ],
    { id: "eleventhDcaTask" }
  );
  const dcaTask12 = m.call(
    testMagicDCA1,
    "createDcaTask",
    [
      newDca.name,
      newDca.amount,
      newDca.interval,
      newDca.maxCount,
      newDca.outputSwaps,
    ],
    { id: "twelvedDcaTask" }
  );
  const dcaTask13 = m.call(
    testMagicDCA1,
    "createDcaTask",
    [
      newDca.name,
      newDca.amount,
      newDca.interval,
      newDca.maxCount,
      newDca.outputSwaps,
    ],
    { id: "thirteenthDcaTask" }
  );
  const dcaTask14 = m.call(
    testMagicDCA1,
    "createDcaTask",
    [
      newDca.name,
      newDca.amount,
      newDca.interval,
      newDca.maxCount,
      newDca.outputSwaps,
    ],
    { id: "fourteenthcaTask" }
  );
  const dcaTask15 = m.call(
    testMagicDCA1,
    "createDcaTask",
    [
      newDca.name,
      newDca.amount,
      newDca.interval,
      newDca.maxCount,
      newDca.outputSwaps,
    ],
    { id: "fifthteenthcaTask" }
  );
  const dcaTask16 = m.call(
    testMagicDCA1,
    "createDcaTask",
    [
      newDca.name,
      newDca.amount,
      newDca.interval,
      newDca.maxCount,
      newDca.outputSwaps,
    ],
    { id: "sixteethTask" }
  );

  return { dcaTask };
});

export default MagicDCAModule;
