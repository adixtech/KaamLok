import mongoose from 'mongoose';
import { config } from './config/env';
import { createApp } from './app';

/**
 * Server entry point.
 * Connects to MongoDB, then starts the Express server.
 */
async function start() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('[KaamLok] Connected to MongoDB');

    const app = createApp();
    const server = app.listen(config.port, () => {
      console.log(`[KaamLok] Server running on port ${config.port} (${config.nodeEnv})`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      console.log(`[KaamLok] ${signal} received, shutting down...`);
      server.close(() => {
        mongoose.connection.close(false).then(() => {
          console.log('[KaamLok] MongoDB disconnected');
          process.exit(0);
        });
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (err) {
    console.error('[KaamLok] Failed to start:', err);
    process.exit(1);
  }
}

start();
