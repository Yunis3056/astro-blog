import {defineCliConfig} from 'sanity/cli';
import {loadEnv} from 'vite';

const env = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), '');
const envValue = (key: string) => process.env[key] || env[key];

export default defineCliConfig({
	api: {
		projectId: envValue('SANITY_STUDIO_PROJECT_ID') || envValue('PUBLIC_SANITY_PROJECT_ID') || '',
		dataset: envValue('SANITY_STUDIO_DATASET') || envValue('PUBLIC_SANITY_DATASET') || 'production-blog',
	},
});
