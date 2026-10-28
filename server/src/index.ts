import { createApp } from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { env } from './config/env.js';

async function bootstrap() {
  try {
    await connectDB();

    const app = createApp();
    const server = app.listen(env.PORT, () => {
      console.log(`=========================================`);
      console.log(`🚀 Team Task Manager Server Running`);
      console.log(`📡 Port: ${env.PORT}`);
      console.log(`🌍 Environment: ${env.NODE_ENV}`);
      console.log(`🔗 Local URL: http://localhost:${env.PORT}`);
      console.log(`=========================================`);
    });

    const shutdown = async (signal: string) => {
      console.log(`\n[Server] Received ${signal}. Gracefully shutting down...`);
      server.close(async () => {
        await disconnectDB();
        console.log('[Server] Process terminated safely.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('[Server] Fatal startup error:', error);
    process.exit(1);
  }
}

bootstrap();
