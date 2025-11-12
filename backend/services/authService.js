import shopify from '../config/shopify.js';
import prisma from '../config/prisma.js';

function isValidShopDomain(shop) {
    return typeof shop === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/.test(shop);
}

function generateNonce(length = 32) {
    return [...Array(length)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
}

export async function shopifyAuth(shop, req, res) {
    if (!isValidShopDomain(shop)) {
        throw new Error('Invalid shop domain');
    }
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
    return authUrl;
}

export async function shopifyAuthOnline(shop, req, res) {
    if (!isValidShopDomain(shop)) {
        throw new Error('Invalid shop domain');
    }
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
    return authUrl;
}

export async function shopifyAuthCallback(req, res) {
    const stateFromCookie = req.cookies?.shopify_oauth_state;
    const stateFromQuery = req.query?.state;
    if (!stateFromCookie || !stateFromQuery || stateFromCookie !== stateFromQuery) {
        throw new Error('Invalid or missing OAuth state');
    }
    const shop = req.query.shop;
    if (!isValidShopDomain(shop)) {
        throw new Error('Invalid shop domain');
    }
    const session = await shopify.auth.callback({
        rawRequest: req,
        rawResponse: res,
    });
    const client = new shopify.clients.Graphql({ session });
    await client.query({
        data: `mutation { webhookSubscriptionCreate(topic: APP_UNINSTALLED, webhookSubscription: { callbackUrl: "${process.env.HOST}/api/webhooks" }) { userErrors { field message } webhookSubscription { id } } }`,
    });
    res.clearCookie('shopify_oauth_state');
    return { shop: session.shop, host: req.query.host };
}

export async function logout(shop) {
    if (shop) {
        const sessions = await prisma.session.findMany({ where: { shop } });
        if (sessions.length > 0) {
            const sessionIds = sessions.map(s => s.id);
            await prisma.session.deleteMany({ where: { id: { in: sessionIds } } });
        }
    }
    return 'Logged out successfully';
    }

export { registerUser, loginUser, getUserProfile };
