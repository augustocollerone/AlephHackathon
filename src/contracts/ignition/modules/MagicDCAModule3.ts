import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const WETH_ADDRESS: string = process.env.WETH_ADDRESS ?? "";
const DAI_ADDRESS: string = process.env.DAI_ADDRESS ?? "";
const USDC_ADDRESS: string = process.env.USDC_ADDRESS ?? "";
const LINK_ADDRESS: string = process.env.LINK_ADDRESS ?? "";
const ARB_ADDRESS: string = process.env.ARB_ADDRESS ?? "";
const UNI_ADDRESS: string = process.env.UNI_ADDRESS ?? "";

const WETH_PRICE_FEED: string = process.env.WETH_PRICE_FEED ?? "";
const LINK_PRICE_FEED: string = process.env.LINK_PRICE_FEED ?? "";
const DAI_PRICE_FEED: string = process.env.DAI_PRICE_FEED ?? "";
const ARB_PRICE_FEED: string = process.env.ARB_PRICE_FEED ?? "";
const UNI_PRICE_FEED: string = process.env.UNI_PRICE_FEED ?? "";

const GELATO_AUTOMATE: string = process.env.GELATO_AUTOMATE ?? "";
const UNISWAP_ROUTER: string = process.env.UNISWAP_ROUTER ?? "";

const GELATO_PAYMENT_TOKEN: string = process.env.GELATO_PAYMENT_TOKEN ?? "";

const MagicDCAModule = buildModule("MagicDCAModule3", (m) => {
  const testMagicDCA1 = m.contract(
    "MagicDCA",
    [GELATO_AUTOMATE, UNISWAP_ROUTER, GELATO_PAYMENT_TOKEN, USDC_ADDRESS],
    {
      id: "testMagicDCA1",
    }
  );

  const newDca = {
    name: "Module Test DCA",
    amount: 300,
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
  m.call(testMagicDCA1, "setOracle", [UNI_ADDRESS, UNI_PRICE_FEED], {
    id: "setOracleUNI",
  });
  m.call(testMagicDCA1, "setOracle", [LINK_ADDRESS, LINK_PRICE_FEED], {
    id: "setOracleLINK",
  });
  m.call(testMagicDCA1, "setOracle", [ARB_ADDRESS, ARB_PRICE_FEED], {
    id: "setOracleARB",
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
  m.call(usdcContract, "approve", [testMagicDCA1, 300]);

  return {};
});

export default MagicDCAModule;
