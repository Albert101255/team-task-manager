import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../config/db.js';
import { env } from '../config/env.js';
import { User } from '../models/User.js';

async function bootstrapAdmin() {
  try {
    await connectDB();

    const email = env.ADMIN_EMAIL.toLowerCase();
    const name = env.ADMIN_NAME;
    const password = env.ADMIN_PASSWORD;

    const existingAdmin = await User.findOne({ email });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    if (existingAdmin) {
      existingAdmin.role = 'admin';
      existingAdmin.name = name;
      existingAdmin.passwordHash = passwordHash;
      await existingAdmin.save();
      console.log(`[Bootstrap] Administrator account updated: ${email}`);
    } else {
      await User.create({
        name,
        email,
        passwordHash,
        role: 'admin',
      });
      console.log(`[Bootstrap] Administrator account created: ${email}`);
    }

    await disconnectDB();
    console.log('[Bootstrap] Completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('[Bootstrap] Failed to bootstrap administrator:', error);
    process.exit(1);
  }
}

bootstrapAdmin();
