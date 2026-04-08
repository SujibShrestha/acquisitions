import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { config as loadEnv } from 'dotenv';

if (process.env.ENV_FILE) {
  const envPath = path.resolve(process.cwd(), process.env.ENV_FILE);

  if (fs.existsSync(envPath)) {
    loadEnv({ path: envPath, override: true });
  }
}

export default {
  schema: './src/models/*.js',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
};
