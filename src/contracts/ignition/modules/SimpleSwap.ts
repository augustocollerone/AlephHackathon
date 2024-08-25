import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const WETH_ADDRESS: string = process.env.WETH_ADDRESS ?? "";
const DAI_ADDRESS: string = process.env.DAI_ADDRESS ?? "";
const USDC_ADDRESS: string = process.env.USDC_ADDRESS ?? "";

const WETH_PRICE_FEED: string = process.env.WETH_PRICE_FEED ?? "";
const DAI_PRICE_FEED: string = process.env.DAI_PRICE_FEED ?? "";

const GELATO_AUTOMATE: string = process.env.GELATO_AUTOMATE ?? "";
const UNISWAP_ROUTER: string = process.env.UNISWAP_ROUTER ?? "";

const GELATO_PAYMENT_TOKEN: string =
  "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

const MagicDCAModule = buildModule("SimpleSwap", (m) => {
  const simpleSwap = m.contract("SimpleSwap", [
    UNISWAP_ROUTER,
    DAI_ADDRESS,
    WETH_ADDRESS,
    USDC_ADDRESS,
  ]);

  const usdcContract = m.contractAt("IERC20", USDC_ADDRESS, {
    id: "usdcContract",
  });
  m.call(usdcContract, "approve", [simpleSwap, 1_000_000_000n]);

  const wETHContract = m.contractAt("IERC20", WETH_ADDRESS, {
    id: "wETHContract",
  });
  // m.call(wETHContract, "deposit", [], {
  //   value: 1_000_000_000n, // 1gwei
  // });

  m.call(wETHContract, "approve", [simpleSwap, 1_000_000_000n]);

  m.call(simpleSwap, "swapWETHForUSDC", [200_000_000n]);

  return { simpleSwap };
});

export default MagicDCAModule;
