import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root or server
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000').transform((val) => parseInt(val, 10)),
  MONGODB_URI: z.string().default('mongodb://127.0.0.1:27017/team_task_manager'),
  JWT_SECRET: z.string().default('taskmanager_dev_super_secret_jwt_key_2026_secure'),
  COOKIE_SECRET: z.string().default('taskmanager_dev_cookie_secret_2026'),
  ADMIN_EMAIL: z.string().email().optional().default('admin@teamtasks.io'),
  ADMIN_PASSWORD: z.string().min(8).optional().default('Admin@123456'),
  ADMIN_NAME: z.string().optional().default('System Administrator'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
