import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root or server
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

const baseEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000').transform((val) => parseInt(val, 10)),
  MONGODB_URI: z.string().default('mongodb://127.0.0.1:27017/team_task_manager'),
  JWT_SECRET: z.string().default('taskmanager_dev_super_secret_jwt_key_2026_secure'),
  COOKIE_SECRET: z.string().default('taskmanager_dev_cookie_secret_2026'),
  ADMIN_EMAIL: z.string().email().optional().default('admin@teamtasks.io'),
  ADMIN_PASSWORD: z.string().min(8).optional().default('Admin@123456'),
  ADMIN_NAME: z.string().optional().default('System Administrator'),
});

const parsed = baseEnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('[Config Error] Invalid base environment variables:', parsed.error.format());
  process.exit(1);
}

const data = parsed.data;

// Production Security Validation
if (data.NODE_ENV === 'production') {
  const errors: string[] = [];

  if (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes('127.0.0.1')) {
    errors.push('MONGODB_URI is required and must point to a production database cluster.');
  }

  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32 || process.env.JWT_SECRET === 'taskmanager_dev_super_secret_jwt_key_2026_secure') {
    errors.push('JWT_SECRET is required and must be a secure random string of at least 32 characters in production.');
  }

  if (!process.env.COOKIE_SECRET || process.env.COOKIE_SECRET.length < 32 || process.env.COOKIE_SECRET === 'taskmanager_dev_cookie_secret_2026') {
    errors.push('COOKIE_SECRET is required and must be a secure random string of at least 32 characters in production.');
  }

  if (process.env.ADMIN_PASSWORD === 'Admin@123456') {
    errors.push('ADMIN_PASSWORD must not use the predictable development default in production.');
  }

  if (errors.length > 0) {
    console.error('[Production Security Failure] Missing or insecure environment configuration:');
    errors.forEach((err) => console.error(` - ${err}`));
    process.exit(1);
  }
}

export const env = data;
