import mongoose from 'mongoose';
import { config } from './config/env';
import { createApp } from './app';
import { assertEmailConfigured } from './services/emailTransport';

/**
 * Server entry point.
 * Connects to MongoDB, verifies email delivery is configured, then starts Express.
 */
async function start() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('[KaamLok] Connected to MongoDB');

    // Report mail delivery status before accepting traffic so a misconfigured
    // mail setup is visible at boot rather than at the first login.
    await assertEmailConfigured();

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
