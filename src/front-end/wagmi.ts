import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { defineChain } from 'viem';
import {
  sepolia,
} from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Forget DCA XYZ',
  projectId: 'YOUR_PROJECT_ID',
  chains: [
    defineChain({
      id: 31337,
      network: 'augusto-fork',
      name: 'Augusto Fork',
      nativeCurrency: {
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18,
      },
      rpcUrls: {
        default: {
          http: ['https://bc8b-190-210-38-133.ngrok-free.app'],
        },
        public: {
          http: ['https://bc8b-190-210-38-133.ngrok-free.app'],
        },
      },
    }),
    // mainnet,
    // polygon,
    // optimism,
    // arbitrum,
    // base,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [sepolia] : []),
  ],
  ssr: true,
});
