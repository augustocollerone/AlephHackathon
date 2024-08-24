import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MagicDCAModule = buildModule("MagicDCAModule", (m) => {
  const gelatoAutomate = "0x2A6C106ae13B558BB9E2Ec64Bd2f1f7BEFF3A5E0";
  const testMagicDCA1 = m.contract("MagicDCA", [gelatoAutomate], {
    id: "testMagicDCA1",
  });

  const task = m.call(testMagicDCA1, "createTask", []);

  const newDca = {
    name: "test",
    amount: 100,
    interval: 300000,
    maxCount: 10,
    feeToken: "0x0000000000000000000000000000000000000000",
  };

  const dcaTask = m.call(testMagicDCA1, "createDcaTask", [
    newDca.name,
    newDca.amount,
    newDca.interval,
    newDca.maxCount,
    newDca.feeToken,
  ]);

  return { dcaTask };
});

export default MagicDCAModule;
