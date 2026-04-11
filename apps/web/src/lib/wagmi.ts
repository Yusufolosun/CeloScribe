// wagmi 2.19.5, viem 2.47.12, @tanstack/react-query 5.97.0, thirdweb 5.119.4
import { createConfig, http } from 'wagmi';
import { injected } from 'wagmi/connectors';

import { celo } from '@/lib/chains';

export const wagmiConfig = createConfig({
  chains: [celo],
  connectors: [
    injected({
      target: 'metaMask',
    }),
  ],
  transports: {
    [celo.id]: http('https://forno.celo.org'),
  },
});