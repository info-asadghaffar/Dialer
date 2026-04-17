import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import routes, { webhookRouter } from './routes';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

dotenv.config();

const app: Application = express();

/**
 * PRODUCTION-GRADE MIDDLEWARE STACK
 */
app.use(helmet());
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'DELETE'] }));
app.use(express.json());
app.use(express.urlencoded({ extended: false })); // Critical for Twilio webhooks

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}
app.use(requestLogger);

/**
 * HEALTH CHECK
 */
app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * ROUTES & WEBHOOKS
 */
app.use('/api/v1', routes);
app.use('/webhooks', webhookRouter);

/**
 * ERROR HANDLING
 */
app.use(errorHandler);

export default app;
