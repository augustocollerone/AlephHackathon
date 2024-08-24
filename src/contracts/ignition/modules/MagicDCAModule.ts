import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const WETH_ADDRESS = "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14";
const DAI_ADDRESS = "0x3e622317f8C93f7328350cF0B56d9eD4C620C5d6";
const USDC_ADDRESS = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";

const WETH_PRICE_FEED = "0x694AA1769357215DE4FAC081bf1f309aDC325306";
const DAI_PRICE_FEED = "0x14866185B1962B63C3Ea9E03Bc1da838bab34C19";

const GELATOAUTOMATE = "0x2A6C106ae13B558BB9E2Ec64Bd2f1f7BEFF3A5E0";
const UNISWAP_ROUTER = "0xb41b78Ce3D1BDEDE48A3d303eD2564F6d1F6fff0";

const MagicDCAModule = buildModule("MagicDCAModule", (m) => {
  const testMagicDCA1 = m.contract(
    "MagicDCA",
    [GELATOAUTOMATE, UNISWAP_ROUTER],
    {
      id: "testMagicDCA1",
    }
  );

  const newDca = {
    name: "test",
    amount: 5,
    interval: 100000,
    maxCount: 10,
    feeToken: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    outputSwaps: [
      { token: WETH_ADDRESS, percentage: 50 },
      { token: DAI_ADDRESS, percentage: 50 },
    ],
  };

  // Fund contract
  m.call(testMagicDCA1, "receive", [], {
    value: 3_000_000_000_000_000n, // 1gwei
  });

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
    newDca.feeToken,
    newDca.outputSwaps,
  ]);

  // Approve contract to use feeToken
  const usdcContract = m.contractAt("IERC20", USDC_ADDRESS);
  m.call(usdcContract, "approve", [testMagicDCA1, 100]);

  return { dcaTask };
});

export default MagicDCAModule;
