// wagmi 2.19.5, viem 2.47.12, @tanstack/react-query 5.97.0, thirdweb 5.119.4
import { createConfig, http } from 'wagmi';
import { injected } from 'wagmi/connectors';

import { celo } from '@/lib/chains';

const miniPayTarget = () => {
  if (typeof window === 'undefined' || window.ethereum?.isMiniPay !== true) {
    return undefined;
  }

  return {
    id: 'miniPay',
    name: 'MiniPay',
    provider(window: Window) {
      return window.ethereum;
    },
  };
};

const celoRpcUrl = process.env.NEXT_PUBLIC_CELO_RPC_URL || 'https://forno.celo.org';

export const wagmiConfig = createConfig({
  chains: [celo],
  connectors: [
    injected({
      target: miniPayTarget,
    }),
  ],
  transports: {
    [celo.id]: http(celoRpcUrl),
  },
});
