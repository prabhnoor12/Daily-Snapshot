import crypto from 'crypto';
import prisma from '../config/prisma.js';
import { PrismaSessionStorage } from '../config/prisma_session_storage.js';

const sessionStorage = new PrismaSessionStorage();

export function verifyShopifyWebhook(req) {
	const hmacHeader = req.headers['x-shopify-hmac-sha256'];
	if (!hmacHeader) return false;
	const secret = process.env.SHOPIFY_API_SECRET;
	const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
	const hash = crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('base64');
	return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(hmacHeader));
}

export const webhookHandlers = {
	'app/uninstalled': async (req) => {
		const { shop } = req.body;
		await prisma.shop.deleteMany({ where: { shop } });
		const sessions = await sessionStorage.findSessionsByShop(shop);
		if (sessions.length > 0) {
			const sessionIds = sessions.map(s => s.id);
			await sessionStorage.deleteSessions(sessionIds);
		}
		return 'App uninstalled webhook processed';
	},
	'orders/create': async (req) => {
		const order = req.body;
		await prisma.order.create({ data: {
			id: order.id.toString(),
			shop: order.shop,
			data: JSON.stringify(order),
			status: order.financial_status || 'created',
		}});
		return 'Order created webhook processed';
	},
	'orders/paid': async (req) => {
		const order = req.body;
		await prisma.order.update({
			where: { id: order.id.toString() },
			data: { status: 'paid', data: JSON.stringify(order) }
		});
		return 'Order paid webhook processed';
	},
	'orders/fulfilled': async (req) => {
		const order = req.body;
		await prisma.order.update({
			where: { id: order.id.toString() },
			data: { status: 'fulfilled', data: JSON.stringify(order) }
		});
		return 'Order fulfilled webhook processed';
	},
	'products/create': async (req) => {
		const product = req.body;
		await prisma.product.create({ data: {
			id: product.id.toString(),
			shop: product.shop,
			data: JSON.stringify(product),
		}});
		return 'Product created webhook processed';
	},
	'products/update': async (req) => {
		const product = req.body;
		await prisma.product.upsert({
			where: { id: product.id.toString() },
			update: { data: JSON.stringify(product) },
			create: { id: product.id.toString(), shop: product.shop, data: JSON.stringify(product) }
		});
		return 'Product updated webhook processed';
	},
	'products/delete': async (req) => {
		const product = req.body;
		await prisma.product.deleteMany({ where: { id: product.id.toString(), shop: product.shop } });
		return 'Product deleted webhook processed';
	},
	'shop/update': async (req) => {
		const shopData = req.body;
		await prisma.shop.updateMany({ where: { shop: shopData.shop }, data: { updatedAt: new Date() } });
		return 'Shop updated webhook processed';
	},
	'customers/create': async (req) => {
		const customer = req.body;
		await prisma.customer.create({ data: {
			id: customer.id.toString(),
			shop: customer.shop,
			data: JSON.stringify(customer),
		}});
		return 'Customer created webhook processed';
	},
	'customers/update': async (req) => {
		const customer = req.body;
		await prisma.customer.upsert({
			where: { id: customer.id.toString() },
			update: { data: JSON.stringify(customer) },
			create: { id: customer.id.toString(), shop: customer.shop, data: JSON.stringify(customer) }
		});
		return 'Customer updated webhook processed';
	},
	'customers/delete': async (req) => {
		const customer = req.body;
		await prisma.customer.deleteMany({ where: { id: customer.id.toString(), shop: customer.shop } });
		return 'Customer deleted webhook processed';
	},
};

export async function processWebhook(req) {
	if (!verifyShopifyWebhook(req)) {
		throw new Error('Invalid webhook signature');
	}
	const topic = req.headers['x-shopify-topic']?.toLowerCase();
	if (topic && webhookHandlers[topic]) {
		return await webhookHandlers[topic](req);
	} else {
		// Fallback: let Shopify SDK process or log unknown topic
		try {
			// You may want to call shopify.webhooks.process here if needed
			return `Webhook processed for topic: ${topic}`;
		} catch (error) {
			throw new Error(`Failed to process webhook: ${error.message}`);
		}
	}
}
