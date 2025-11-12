import shopify from '../config/shopify.js';
import prisma from '../config/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { BadRequestError, UnauthorizedError } from '../utils/apiError.js';
import { z } from 'zod';
import { redis, checkAndRefreshRedisConnection } from '../config/redis.js';
import { PRO_PLAN, buildReturnUrl } from '../config/plans.js';

// Zod schema for subscription creation
const subscriptionSchema = z.object({
    planName: z.string().min(1),
    price: z.number().positive(),
    trialDays: z.number().int().min(0).optional(),
    returnUrl: z.string().url()
});

function logSubscriptionAction(action, details) {
    console.log(`[Subscription] ${action}:`, details);
}

// Helper: get shop session
async function getShopSession(shop) {
    const dbShop = await prisma.shop.findUnique({ where: { shop } });
    if (!dbShop || !dbShop.accessToken) throw new UnauthorizedError('Shop session not found');
    return {
        shop: dbShop.shop,
        accessToken: dbShop.accessToken
    };
}

// Create a recurring charge for a customer using Shopify Billing API
export const createSubscription = asyncHandler(async (req, res) => {
    const { shop } = req.user;
    const parsed = subscriptionSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new BadRequestError('Invalid input', parsed.error.errors);
    }
    const { planName, price, trialDays, returnUrl } = parsed.data;
    const session = await getShopSession(shop);
    const client = new shopify.clients.Rest({
        session: {
            shop: session.shop,
            accessToken: session.accessToken
        }
    });
    // Create the recurring application charge
    let charge;
    try {
        const response = await client.post({
            path: 'recurring_application_charges',
            data: {
                recurring_application_charge: {
                    name: planName,
                    price: Number(price),
                    trial_days: trialDays || 0,
                    return_url: returnUrl,
                    test: process.env.NODE_ENV !== 'production'
                }
            },
            type: 'application/json'
        });
        charge = response.body.recurring_application_charge;
    } catch (err) {
        logSubscriptionAction('create_failed', { shop, error: err.message });
        throw new BadRequestError('Shopify API error', err.message);
    }
    // Store charge info in DB
    await prisma.subscription.create({
        data: {
            shop,
            chargeId: charge.id,
            planName,
            price: Number(price),
            status: charge.status,
            confirmationUrl: charge.confirmation_url
        }
    });
    logSubscriptionAction('create', { shop, chargeId: charge.id, planName });
    res.status(201).json(new ApiResponse(201, charge, 'Subscription charge created'));
});

// Convenience endpoint: create default Pro plan subscription ($20, 14-day trial)
export const createProSubscription = asyncHandler(async (req, res) => {
    const shop = req.user?.shop || req.query?.shop; // allow query fallback
    if (!shop) throw new UnauthorizedError('Shop session not found');
    const session = await getShopSession(shop);
    const client = new shopify.clients.Rest({
        session: { shop: session.shop, accessToken: session.accessToken }
    });

    const returnUrl = buildReturnUrl(shop);
    let charge;
    try {
        const response = await client.post({
            path: 'recurring_application_charges',
            data: {
                recurring_application_charge: {
                    name: PRO_PLAN.name,
                    price: Number(PRO_PLAN.price),
                    trial_days: PRO_PLAN.trialDays,
                    return_url: returnUrl,
                    test: process.env.NODE_ENV !== 'production'
                }
            },
            type: 'application/json'
        });
        charge = response.body.recurring_application_charge;
    } catch (err) {
        logSubscriptionAction('create_pro_failed', { shop, error: err.message });
        throw new BadRequestError('Shopify API error', err.message);
    }
    await prisma.subscription.create({
        data: {
            shop,
            chargeId: charge.id,
            planName: PRO_PLAN.name,
            price: Number(PRO_PLAN.price),
            status: charge.status,
            confirmationUrl: charge.confirmation_url
        }
    });
    logSubscriptionAction('create_pro', { shop, chargeId: charge.id });
    res.status(201).json(new ApiResponse(201, charge, 'Pro subscription charge created'));
});

// List subscriptions for a shop (paginated)
export const listSubscriptions = asyncHandler(async (req, res) => {
    const { shop } = req.user;
    let { limit = 20, offset = 0 } = req.query;
    limit = Math.max(1, Math.min(Number(limit), 100));
    offset = Math.max(0, Number(offset));
    const subs = await prisma.subscription.findMany({
        where: { shop, cancelledAt: null },
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' }
    });
    res.json(new ApiResponse(200, subs));
});

// Cancel a subscription (soft delete)
export const cancelSubscription = asyncHandler(async (req, res) => {
    const { shop } = req.user;
    const { chargeId } = req.params;
    const session = await getShopSession(shop);
    const client = new shopify.clients.Rest({
        session: {
            shop: session.shop,
            accessToken: session.accessToken
        }
    });
    try {
        await client.post({
            path: `recurring_application_charges/${chargeId}/cancel`,
            type: 'application/json'
        });
    } catch (err) {
        logSubscriptionAction('cancel_failed', { shop, chargeId, error: err.message });
        throw new BadRequestError('Shopify API error', err.message);
    }
    await prisma.subscription.update({
        where: { chargeId: Number(chargeId) },
        data: { status: 'cancelled', cancelledAt: new Date() }
    });
    logSubscriptionAction('cancel', { shop, chargeId });
    res.json(new ApiResponse(200, null, 'Subscription cancelled'));
});
