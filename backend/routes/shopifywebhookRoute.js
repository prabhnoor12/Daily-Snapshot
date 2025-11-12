
import { Router } from 'express';
import { processWebhook } from '../controllers/shopify_webhooks_controller.js';
import express from 'express';

const router = Router();

// Use express.raw to get the raw body, which is required for webhook validation
router.post('/', express.raw({ type: 'application/json' }), processWebhook);

// Optionally, support topic-specific endpoints if needed
// router.post('/orders/create', express.raw({ type: 'application/json' }), processWebhook);
// router.post('/products/create', express.raw({ type: 'application/json' }), processWebhook);
// ... add more as needed

export default router;
