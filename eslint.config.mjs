import { defineConfig } from 'eslint/config';

import webConfig from './apps/web/eslint.config.mjs';

export default defineConfig([
	{
		settings: {
			next: {
				rootDir: ['apps/web'],
			},
		},
	},
	...webConfig,
]);