import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import hpp from 'hpp';
import dotenv from 'dotenv';
import { correlationId } from './middleware/correlation_id.js';
import { requestLogger } from './middleware/request_logger.js';
import { defaultLimiter } from './middleware/rate_limiting.js';
import { errorHandler } from './middleware/error_handling.js';
import { secureHeaders, enforceHTTPS, setSecureCookie } from './utils/security.js';

import authRouter from './routes/authRoute.js';
import webhookRouter from './routes/shopifywebhookRoute.js';
import analyticsRouter from './routes/analyticsRoute.js';
import userRouter from './routes/userRoute.js';
import sessionRouter from './routes/sesssionRoute.js';
import settingRouter from './routes/settingRoute.js';
import subscriptionRouter from './routes/subscriptionRoute.js';
import notificationRouter from './routes/notificationRoute.js';

dotenv.config({ quiet: true });

if (!process.env.JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET is not defined.');
    process.exit(1);
}

const app = express();
const port = process.env.PORT || 3000;

// Security headers (from security.js)
secureHeaders(app);
// Enforce HTTPS (from security.js) - disable in test environment
if (process.env.NODE_ENV !== 'test') {
  app.use(enforceHTTPS);
}
// Prevent HTTP parameter pollution
app.use(hpp());
// Enable CORS
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
// Compression
app.use(compression());
// Correlation ID for tracing
app.use(correlationId);
// Logging
app.use(requestLogger);
// Rate limiting
app.use(defaultLimiter);

// Add test user role middleware for tests
if (process.env.NODE_ENV === 'test') {
  app.use((req, res, next) => {
    // Provide a test user with id and role so handlers that rely on req.user.id work in tests
    req.user = { id: 1, role: 'admin' };
    next();
  });
}

// Webhook routes need the raw body, so they are mounted before the JSON parser
app.use('/api/webhooks', webhookRouter);

// Parse JSON bodies for all other routes
app.use(express.json());

// Mount API routes
app.use('/api/auth', authRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/users', userRouter);
app.use('/api/sessions', sessionRouter);
app.use('/api/settings', settingRouter);
app.use('/api/subscriptions', subscriptionRouter);
app.use('/api/notifications', notificationRouter);

app.get('/', (req, res) => {
  // Example: set a secure cookie
  setSecureCookie(res, 'example', 'secureValue');
  res.send('Hello World! This is the backend for the Daily Snapshot app.');
});

// Error handling middleware (last)
app.use(errorHandler);


if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Daily Snapshot backend running on port ${port}`);
  });
}

export default app;
