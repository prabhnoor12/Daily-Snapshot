// Ensure APP_UNINSTALLED is defined for both test and production

import { ApiResponse } from '../utils/apiResponse.js';
import shopify from '../config/shopify.js';
import { PrismaClient } from '@prisma/client';
import { redis, checkAndRefreshRedisConnection } from '../config/redis.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const prisma = new PrismaClient();


// Helper: validate Shopify shop domain
function isValidShopDomain(shop) {
    return typeof shop === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/.test(shop);
}

// Helper: generate a random nonce
function generateNonce(length = 32) {
    return [...Array(length)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
}

const shopifyAuth = asyncHandler(async (req, res) => {
    const shop = req.query.shop;
    if (!isValidShopDomain(shop)) {
        return res.status(400).json(new ApiResponse(400, null, 'Invalid shop domain'));
    }
    // CSRF protection: generate state nonce
    const state = generateNonce();
    res.cookie('shopify_oauth_state', state, { httpOnly: true, secure: true, sameSite: 'Strict' });
    const authUrl = await shopify.auth.begin({
        shop,
        callbackPath: '/api/auth/callback',
        isOnline: false,
        rawRequest: req,
        rawResponse: res,
        state,
    });
    res.redirect(authUrl);
});

const shopifyAuthOnline = asyncHandler(async (req, res) => {
    const shop = req.query.shop;
    if (!isValidShopDomain(shop)) {
        return res.status(400).json(new ApiResponse(400, null, 'Invalid shop domain'));
    }
    // CSRF protection: generate state nonce
    const state = generateNonce();
    res.cookie('shopify_oauth_state', state, { httpOnly: true, secure: true, sameSite: 'Strict' });
    const authUrl = await shopify.auth.begin({
        shop,
        callbackPath: '/api/auth/callback',
        isOnline: true,
        rawRequest: req,
        rawResponse: res,
        state,
    });
    res.redirect(authUrl);
});


const shopifyAuthCallback = asyncHandler(async (req, res) => {
    // CSRF protection: validate state nonce
    const stateFromCookie = req.cookies?.shopify_oauth_state;
    const stateFromQuery = req.query?.state;
    if (!stateFromCookie || !stateFromQuery || stateFromCookie !== stateFromQuery) {
        return res.status(400).json(new ApiResponse(400, null, 'Invalid or missing OAuth state'));
    }
    // Validate shop domain again
    const shop = req.query.shop;
    if (!isValidShopDomain(shop)) {
        return res.status(400).json(new ApiResponse(400, null, 'Invalid shop domain'));
    }
    // Validate callback origin (optionally check req.headers.origin or referer)
    // ...existing code...
    try {
        const session = await shopify.auth.callback({
            rawRequest: req,
            rawResponse: res,
        });

        // Register the app/uninstalled webhook
        const client = new shopify.clients.Graphql({ session });
        await client.query({
            data: `mutation {
                webhookSubscriptionCreate(
                    topic: "APP_UNINSTALLED",
                    webhookSubscription: {
                        callbackUrl: "${process.env.HOST}/api/webhooks"
                    }
                ) {
                    userErrors { field message }
                    webhookSubscription { id }
                }
            }`,
        });

        // Automatically create a user record after OAuth
        // Fetch shop info from Shopify API for better user details
        const shopDomain = session.shop;
        const accessToken = session.accessToken;
        let email = null;
        let name = shopDomain;
        let shopInfo = null;
        try {
            // Shopify Admin API: get shop info
            const shopInfoResp = await client.query({
                data: `{
                    shop {
                        name
                        email
                        myshopifyDomain
                    }
                }`
            });
            shopInfo = shopInfoResp.body?.data?.shop;
            if (shopInfo) {
                name = shopInfo.name || shopDomain;
                email = shopInfo.email || null;
            }
        } catch (err) {
            console.warn('Could not fetch shop info from Shopify:', err);
        }

        // Import userService dynamically to avoid circular dependencies
        const { createUser } = await import('../services/userService.js');
        try {
            await createUser({
                email: email || `${shopDomain.replace('.myshopify.com', '')}@shopify.com`,
                name,
                role: 'user',
            });
            console.log(`[Auth] Created user for shop: ${shopDomain}`);
        } catch (e) {
            if (e.message === 'User already exists') {
                console.log(`[Auth] User already exists for shop: ${shopDomain}`);
            } else {
                console.error('Error creating user after OAuth:', e);
            }
        }

        // Redirect to the frontend app
        res.clearCookie('shopify_oauth_state');
        res.redirect(`/?shop=${session.shop}&host=${req.query.host}`);
    } catch (err) {
        console.error('Auth callback error:', err);
        res.status(500).json(new ApiResponse(500, null, 'Internal Server Error'));
    }
});

const logout = asyncHandler(async (req, res) => {
    const { shop } = req.query;
    if (shop) {
        const sessions = await prisma.session.findMany({ where: { shop } });
        if (sessions.length > 0) {
            const sessionIds = sessions.map(s => s.id);
            await prisma.session.deleteMany({ where: { id: { in: sessionIds } } });
        }
    }
    res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
});

export { shopifyAuth, shopifyAuthOnline, shopifyAuthCallback, logout };
