import { asyncHandler } from '../utils/asyncHandler.js';
import shopify from '../config/shopify.js';
import { PrismaSessionStorage } from '../config/prisma_session_storage.js';
import crypto from 'crypto';
import { redis, checkAndRefreshRedisConnection } from '../config/redis.js';
import * as notificationService from '../services/notificationService.js';

const sessionStorage = new PrismaSessionStorage();

function verifyShopifyWebhook(req) {
    const hmacHeader = req.headers['x-shopify-hmac-sha256'];
    if (!hmacHeader) return false;
    const secret = process.env.SHOPIFY_API_SECRET;
    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    const hash = crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('base64');
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(hmacHeader));
}

// Handlers for each webhook topic

import prisma from '../config/prisma.js';

const webhookHandlers = {
    'app/uninstalled': async (req, res) => {
        const { shop } = req.body;
        // Remove shop and sessions
        await prisma.shop.deleteMany({ where: { shop } });
        const sessions = await sessionStorage.findSessionsByShop(shop);
        if (sessions.length > 0) {
            const sessionIds = sessions.map(s => s.id);
            await sessionStorage.deleteSessions(sessionIds);
        }
        res.status(200).send('App uninstalled webhook processed');
    },
    'orders/create': async (req, res) => {
        const order = req.body;
        const shop = await prisma.shop.findUnique({ where: { shop: order.shop } });
        if (shop) {
            const user = await prisma.user.findFirst({ where: { name: shop.shop } });
            if (user) {
                await notificationService.createNotification(user.id, `New order #${order.order_number} received.`, 'new_order');
            }
        }
        // Example: log order, store minimal info
        await prisma.order.create({ data: {
            id: order.id.toString(),
            shop: order.shop,
            data: JSON.stringify(order),
            status: order.financial_status || 'created',
        }}).catch((err) => { console.error('Order create error:', err); });
        res.status(200).send('Order created webhook processed');
    },
    'orders/paid': async (req, res) => {
        const order = req.body;
        const shop = await prisma.shop.findUnique({ where: { shop: order.shop } });
        if (shop) {
            const user = await prisma.user.findFirst({ where: { name: shop.shop } });
            if (user) {
                await notificationService.createNotification(user.id, `Order #${order.order_number} has been paid.`, 'order_paid');
            }
        }
        await prisma.order.update({
            where: { id: order.id.toString() },
            data: { status: 'paid', data: JSON.stringify(order) }
        }).catch((err) => { console.error('Order paid error:', err); });
        res.status(200).send('Order paid webhook processed');
    },
    'orders/fulfilled': async (req, res) => {
        const order = req.body;
        const shop = await prisma.shop.findUnique({ where: { shop: order.shop } });
        if (shop) {
            const user = await prisma.user.findFirst({ where: { name: shop.shop } });
            if (user) {
                await notificationService.createNotification(user.id, `Order #${order.order_number} has been fulfilled.`, 'order_fulfilled');
            }
        }
        await prisma.order.update({
            where: { id: order.id.toString() },
            data: { status: 'fulfilled', data: JSON.stringify(order) }
        }).catch((err) => { console.error('Order fulfilled error:', err); });
        res.status(200).send('Order fulfilled webhook processed');
    },
    'products/create': async (req, res) => {
        const product = req.body;
        await prisma.product.create({ data: {
            id: product.id.toString(),
            shop: product.shop,
            data: JSON.stringify(product),
        }}).catch((err) => { console.error('Product create error:', err); });
        res.status(200).send('Product created webhook processed');
    },
    'products/update': async (req, res) => {
        const product = req.body;
        await prisma.product.upsert({
            where: { id: product.id.toString() },
            update: { data: JSON.stringify(product) },
            create: { id: product.id.toString(), shop: product.shop, data: JSON.stringify(product) }
        }).catch((err) => { console.error('Product update error:', err); });
        res.status(200).send('Product updated webhook processed');
    },
    'products/delete': async (req, res) => {
        const product = req.body;
    await prisma.product.deleteMany({ where: { id: product.id.toString(), shop: product.shop } }).catch((err) => { console.error('Product delete error:', err); });
        res.status(200).send('Product deleted webhook processed');
    },
    'shop/update': async (req, res) => {
        const shopData = req.body;
    await prisma.shop.updateMany({ where: { shop: shopData.shop }, data: { updatedAt: new Date() } }).catch((err) => { console.error('Shop update error:', err); });
        res.status(200).send('Shop updated webhook processed');
    },
    'customers/create': async (req, res) => {
        const customer = req.body;
        const shop = await prisma.shop.findUnique({ where: { shop: customer.shop } });
        if (shop) {
            const user = await prisma.user.findFirst({ where: { name: shop.shop } });
            if (user) {
                await createNotificationHandler(user.id, `New customer: ${customer.first_name} ${customer.last_name}.`, 'new_customer');
            }
        }
        await prisma.customer.create({ data: {
            id: customer.id.toString(),
            shop: customer.shop,
            data: JSON.stringify(customer),
        }}).catch((err) => { console.error('Customer create error:', err); });
        res.status(200).send('Customer created webhook processed');
    },
    'customers/update': async (req, res) => {
        const customer = req.body;
        await prisma.customer.upsert({
            where: { id: customer.id.toString() },
            update: { data: JSON.stringify(customer) },
            create: { id: customer.id.toString(), shop: customer.shop, data: JSON.stringify(customer) }
        }).catch((err) => { console.error('Customer update error:', err); });
        res.status(200).send('Customer updated webhook processed');
    },
    'customers/delete': async (req, res) => {
        const customer = req.body;
    await prisma.customer.deleteMany({ where: { id: customer.id.toString(), shop: customer.shop } }).catch((err) => { console.error('Customer delete error:', err); });
        res.status(200).send('Customer deleted webhook processed');
    },
};

// Generic dispatcher for Shopify webhooks
const processWebhook = asyncHandler(async (req, res) => {
    if (!verifyShopifyWebhook(req)) {
        return res.status(401).send('Invalid webhook signature');
    }
    const topic = req.headers['x-shopify-topic']?.toLowerCase();
    if (topic && webhookHandlers[topic]) {
        await webhookHandlers[topic](req, res);
    } else {
        // Fallback: let Shopify SDK process or log unknown topic
        try {
            await shopify.webhooks.process({
                rawBody: req.body,
                rawRequest: req,
                rawResponse: res,
            });
            console.log(`Webhook processed for topic: ${topic}`);
        } catch (error) {
            console.error(`Failed to process webhook: ${error.message}`);
            if (!res.headersSent) {
                res.status(500).send(error.message);
            }
        }
    }
});

export { processWebhook };
