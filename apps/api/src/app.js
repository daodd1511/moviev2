import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { getDatabaseState } from './config/db.config.js';
import { logger as defaultLogger, createHttpLogger } from './logger.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import { requestId } from './middleware/request-id.middleware.js';
import { verifyToken } from './middleware/auth.middleware.js';
import router from './router/router.js';

const parseCorsOrigins = () =>
  (process.env.CORS_ORIGINS ?? 'http://localhost:3000')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

/**
 * Builds the Express application without connecting to MongoDB or opening a port, so it
 * can be constructed synchronously in tests. `apps/api/index.js` owns the database
 * connection and HTTP listener for process startup.
 */
export const createApp = ({ logger = defaultLogger } = {}) => {
  const app = express();
  app.locals.logger = logger;
  // Trust exactly one hop (the platform's load balancer/reverse proxy) so req.ip reflects
  // the real client for rate limiting instead of the proxy's address.
  app.set('trust proxy', 1);

  app.use(requestId);
  app.use(createHttpLogger(logger));
  app.use(helmet());
  app.use(cors({ origin: parseCorsOrigins() }));
  app.use(express.json({ limit: '100kb' }));

  // Unauthenticated and DB-independent on purpose: this answers "is the process up",
  // which is what the deploy gate and the container HEALTHCHECK ask. It stays green if
  // Mongo is down, so monitor a real data route separately.
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Database-aware: 200 only while Mongoose is connected, so orchestration can hold
  // traffic back from an instance that's up but can't yet reach MongoDB.
  app.get('/ready', (req, res) => {
    const isConnected = getDatabaseState() === 1;
    res.status(isConnected ? 200 : 503).json({ status: isConnected ? 'ok' : 'unavailable' });
  });

  app.use('/api', router);
  app.get('/', verifyToken, (req, res) => {
    res.send('Hello from movie backend');
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
