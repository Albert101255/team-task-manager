import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../config/db.js';
import { env } from '../config/env.js';
import { User } from '../models/User.js';

async function bootstrapAdmin() {
  try {
    const isProduction = env.NODE_ENV === 'production';
    const email = env.ADMIN_EMAIL.toLowerCase();
    const name = env.ADMIN_NAME;
    const password = env.ADMIN_PASSWORD;

    if (isProduction) {
      if (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD === 'Admin@123456') {
        console.error('[Bootstrap Error] In production, ADMIN_PASSWORD must be explicitly provided and must not use the development default.');
        process.exit(1);
      }
      if (password.length < 12) {
        console.error('[Bootstrap Error] In production, ADMIN_PASSWORD must be at least 12 characters long.');
        process.exit(1);
      }
    }

    await connectDB();

    const existingAdmin = await User.findOne({ email });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    if (existingAdmin) {
      existingAdmin.role = 'admin';
      existingAdmin.name = name;
      existingAdmin.passwordHash = passwordHash;
      await existingAdmin.save();
      console.log(`[Bootstrap] Administrator account updated successfully: ${email}`);
    } else {
      await User.create({
        name,
        email,
        passwordHash,
        role: 'admin',
      });
      console.log(`[Bootstrap] Administrator account created successfully: ${email}`);
    }

    await disconnectDB();
    console.log('[Bootstrap] Operation completed.');
    process.exit(0);
  } catch (error) {
    console.error('[Bootstrap Error] Failed to bootstrap administrator.');
    process.exit(1);
  }
}

bootstrapAdmin();
