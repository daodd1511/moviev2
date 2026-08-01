import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { verifyToken } from './middleware/auth.middleware.js';
import router from './router/router.js';

/**
 * Builds the Express application without connecting to MongoDB or opening a port, so it
 * can be constructed synchronously in tests. `apps/api/index.js` owns the database
 * connection and HTTP listener for process startup.
 */
export const createApp = ({ logger } = {}) => {
  const app = express();
  app.locals.logger = logger;
  app.use(helmet()).use(morgan('dev')).use(cors()).use(express.json());

  // Unauthenticated and DB-independent on purpose: this answers "is the process up",
  // which is what the deploy gate and the container HEALTHCHECK ask. It stays green if
  // Mongo is down, so monitor a real data route separately.
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api', router);
  app.get('/', verifyToken, (req, res) => {
    res.send('Hello from movie backend');
  });

  return app;
};
