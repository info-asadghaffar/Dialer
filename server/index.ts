import app from './src/app';
import dotenv from 'dotenv';
import { logger } from './src/utils/logger';

dotenv.config();

/**
 * PORT CONFIGURATION
 */
const PORT = process.env.PORT || 4000;

/**
 * START SERVER
 */
const server = app.listen(PORT, () => {
    logger.info(`🚀 NexaDial Backend running on port ${PORT}`);
    logger.info(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
});

/**
 * HANDLE GRACEFUL SHUTDOWN
 */
process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        logger.info('Process terminated.');
    });
});
