import { Router } from 'express';
import {
    getDailySnapshot,
    getTrend,
    getDayOverDay,
    getRange,
    getTopProducts,
    getOrderStatus,
    getCustomerInsights,
    exportAnalytics,
    getForecast,
    getAnomalies
} from '../controllers/analytics_controler.js';
import { billingGuard } from '../middleware/billing_guard.js';
// import rateLimiter and requestLogger if needed
// import rateLimiter from '../middleware/rate_limiting.js';
// import requestLogger from '../middleware/request_logger.js';

const router = Router();

// router.use(rateLimiter); // Uncomment to enable rate limiting
// router.use(requestLogger); // Uncomment to enable logging

// Require active subscription (bypassed in tests automatically)
router.use(billingGuard);

router.get('/snapshot', getDailySnapshot);
router.get('/trend', getTrend);
router.get('/compare', getDayOverDay);
router.get('/range', getRange);
router.get('/products/top', getTopProducts);
router.get('/orders/status', getOrderStatus);
router.get('/customers/insights', getCustomerInsights);
router.get('/export', exportAnalytics);
router.get('/forecast', getForecast);
router.get('/anomalies', getAnomalies);

export default router;
