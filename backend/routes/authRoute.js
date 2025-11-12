import { Router } from 'express';

import { shopifyAuth, shopifyAuthOnline, shopifyAuthCallback, logout } from '../controllers/auth_controller.js';
import { verifyAuth } from '../middleware/auth_middlware.js';
import { authLimiter } from '../middleware/rate_limiting.js';
import { requestLogger } from '../middleware/request_logger.js';

const router = Router();

// Apply request logging to all auth endpoints
router.use(requestLogger);

// This is the initial auth flow for the app installation (offline token)
router.get('/auth', authLimiter, shopifyAuth);

// This is the auth flow for when a user logs into the app (online token)
router.get('/auth/online', authLimiter, shopifyAuthOnline);

// This is the callback for both auth flows
router.get('/auth/callback', authLimiter, shopifyAuthCallback);

router.get('/logout', logout);

// Example of a protected route
// Any route defined after this middleware will be protected
router.use(verifyAuth);


// Return current authenticated user/shop info
router.get('/me', async (req, res) => {
    try {
        // Session and client are attached by verifyAuth middleware
        const { session } = res.locals.shopify;
        // Find user by shop email (or shop domain)
        const prisma = req.app.get('prisma') || require('../config/prisma.js').default;
        let user = null;
        // Try to find user by shop domain email
        user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: `${session.shop.replace('.myshopify.com', '')}@shopify.com` },
                    { name: session.shop },
                ]
            }
        });
        res.json({
            id: user?.id || null,
            shopId: session.shop,
            accessToken: session.accessToken,
            email: user?.email || null,
        });
    } catch (err) {
        res.status(401).json({ error: 'Not authenticated' });
    }
});

export default router;
