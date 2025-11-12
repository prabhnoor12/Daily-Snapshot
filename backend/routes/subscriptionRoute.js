import { Router } from 'express';
import {
    createSubscription,
    listSubscriptions,
    cancelSubscription,
    createProSubscription
} from '../controllers/subscription_controller.js';
// import rateLimiter and requestLogger if needed
// import rateLimiter from '../middleware/rate_limiting.js';
// import requestLogger from '../middleware/request_logger.js';

const router = Router();

// router.use(rateLimiter); // Uncomment to enable rate limiting
// router.use(requestLogger); // Uncomment to enable logging

router.post('/', createSubscription);
// Default Pro plan ($20, 14-day trial) helper endpoint
router.post('/pro', createProSubscription);
router.get('/', listSubscriptions);
router.post('/:chargeId/cancel', cancelSubscription);

export default router;
