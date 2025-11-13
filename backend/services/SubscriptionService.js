import shopify from '../config/shopify.js';
import prisma from '../config/prisma.js';
import { z } from 'zod';

const subscriptionSchema = z.object({
	planName: z.string().min(1),
	price: z.number().positive(),
	trialDays: z.number().int().min(0).optional(),
	returnUrl: z.string().url()
});

async function getShopSession(shop) {
	const dbShop = await prisma.shop.findUnique({ where: { shop } });
	if (!dbShop || !dbShop.accessToken) throw new Error('Shop session not found');
	return {
		shop: dbShop.shop,
		accessToken: dbShop.accessToken
	};
}

export async function createSubscription(shop, body) {
	const parsed = subscriptionSchema.safeParse(body);
	if (!parsed.success) {
		throw new Error('Invalid input');
	}
	const { planName, price, trialDays, returnUrl } = parsed.data;
	const session = await getShopSession(shop);
	const client = new shopify.clients.Rest({
		session: {
			shop: session.shop,
			accessToken: session.accessToken
		}
	});
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
		throw new Error('Shopify API error: ' + err.message);
	}
	await prisma.subscription.create({
		data: {
			shop,
			chargeId: charge.id,
			planName,
			price: Number(price),
			status: String(charge.status).toLowerCase(),
			confirmationUrl: charge.confirmation_url
		}
	});
	return charge;
}

export async function listSubscriptions(shop, limit = 20, offset = 0) {
	limit = Math.max(1, Math.min(Number(limit), 100));
	offset = Math.max(0, Number(offset));
	return await prisma.subscription.findMany({
		where: { shop, cancelledAt: null },
		skip: offset,
		take: limit,
		orderBy: { createdAt: 'desc' }
	});
}

export async function cancelSubscription(shop, chargeId) {
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
		throw new Error('Shopify API error: ' + err.message);
	}
	await prisma.subscription.update({
		where: { chargeId: Number(chargeId) },
		data: { status: 'cancelled', cancelledAt: new Date() }
	});
	return 'Subscription cancelled';
}
