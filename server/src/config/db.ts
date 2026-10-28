import mongoose from 'mongoose';
import { env } from './env.js';

let isConnected = false;

export async function connectDB(uri?: string): Promise<typeof mongoose> {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose;
  }

  const connectionUri = uri || env.MONGODB_URI;

  try {
    const conn = await mongoose.connect(connectionUri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`[Database] MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('[Database] Failed to connect to MongoDB:', error);
    if (env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    throw error;
  }
}

export async function disconnectDB(): Promise<void> {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('[Database] MongoDB disconnected');
  }
}
