import { Router } from 'express';
import {
    getSettings,
    getSetting,
    updateSetting,
    bulkUpdateSettings,
    deleteSetting
} from '../controllers/settings_controller.js';
// import rateLimiter and requestLogger if needed
// import rateLimiter from '../middleware/rate_limiting.js';
// import requestLogger from '../middleware/request_logger.js';

const router = Router();

// router.use(rateLimiter); // Uncomment to enable rate limiting
// router.use(requestLogger); // Uncomment to enable logging

router.get('/', getSettings);
// Alias for appearance setting to support language flow
router.get('/appearance', (req, res, next) => {
    req.params.key = 'appearance';
    return getSetting(req, res, next);
});
router.get('/:key', getSetting);
// Important: define the specific /bulk route BEFORE the parameterized :key route
router.put('/bulk', ...bulkUpdateSettings);
router.put('/:key', ...updateSetting);
router.delete('/:key', ...deleteSetting);

export default router;
