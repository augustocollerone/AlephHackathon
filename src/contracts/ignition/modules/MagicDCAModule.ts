import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const DAI_ADDRESS = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
const USDC_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

const MagicDCAModule = buildModule("MagicDCAModule", (m) => {
  const gelatoAutomate = "0x2A6C106ae13B558BB9E2Ec64Bd2f1f7BEFF3A5E0";
  const testMagicDCA1 = m.contract("MagicDCA", [gelatoAutomate], {
    id: "testMagicDCA1",
  });

  const newDca = {
    name: "test",
    amount: 100,
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

  const dcaTask = m.call(testMagicDCA1, "createDcaTask", [
    newDca.name,
    newDca.amount,
    newDca.interval,
    newDca.maxCount,
    newDca.feeToken,
    newDca.outputSwaps,
  ]);

  return { dcaTask };
});

export default MagicDCAModule;
