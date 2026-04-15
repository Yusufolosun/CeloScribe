import { createThirdwebClient } from 'thirdweb';

import { requirePublicEnv } from './publicEnv';

export const thirdwebClient = createThirdwebClient({
  clientId: requirePublicEnv('NEXT_PUBLIC_THIRDWEB_CLIENT_ID'),
});
