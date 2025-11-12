import prisma from '../config/prisma.js';
import shopify from '../config/shopify.js';
import NodeCache from 'node-cache';

const analyticsCache = new NodeCache({ stdTTL: 60 });

const metrics = {
	sales: orders => orders.reduce((sum, o) => sum + parseFloat(o.totalPrice), 0),
	orders: orders => orders.length,
	aov: orders => orders.length > 0 ? orders.reduce((sum, o) => sum + parseFloat(o.totalPrice), 0) / orders.length : 0,
	topProduct: orders => {
		const productSales = {};
		orders.forEach(order => {
			order.lineItems.edges.forEach(item => {
				const prod = item.node.product;
				if (!prod) return;
				const revenue = parseFloat(item.node.discountedTotal) || 0;
				if (!productSales[prod.id]) {
					productSales[prod.id] = { id: prod.id, title: prod.title, revenue: 0 };
				}
				productSales[prod.id].revenue += revenue;
			});
		});
		return Object.values(productSales).sort((a, b) => b.revenue - a.revenue)[0] || null;
	}
};

async function getShopSession(shop) {
	const dbShop = await prisma.shop.findUnique({ where: { shop } });
	if (!dbShop || !dbShop.accessToken) throw new Error('Shop session not found');
	return {
		shop: dbShop.shop,
		accessToken: dbShop.accessToken
	};
}

async function fetchOrders(client, start, end) {
	const orderQuery = `{
		orders(first: 100, query: "created_at:>='${start}' created_at<='${end}'", sortKey:CREATED_AT, reverse:true) {
			edges {
				node {
					id
					totalPrice
					createdAt
					financialStatus
					fulfillmentStatus
					customer { id }
					lineItems(first: 50) {
						edges {
							node {
								product { id title }
								quantity
								discountedTotal
							}
						}
					}
				}
			}
		}
	}`;
	const orderResp = await client.query({ data: orderQuery });
	return orderResp.body.data.orders.edges.map(e => e.node);
}

export async function getDailySnapshot(shop, userId) {
	const cacheKey = `snapshot:${shop}`;
	const cached = analyticsCache.get(cacheKey);
	if (cached) {
		return cached;
	}
	const session = await getShopSession(shop);
	const client = new shopify.clients.Graphql({
		session: {
			shop: session.shop,
			accessToken: session.accessToken
		}
	});
	const now = new Date();
	const start = now.toISOString().split('T')[0] + 'T00:00:00.000Z';
	const end = now.toISOString().split('T')[0] + 'T23:59:59.999Z';
	let orders = await fetchOrders(client, start, end);
	const sales = metrics.sales(orders);
	const orderCount = metrics.orders(orders);
	const aov = metrics.aov(orders);
	const topProduct = metrics.topProduct(orders);
	const result = {
		sales: Number(sales.toFixed(2)),
		orders: orderCount,
		aov: Number(aov.toFixed(2)),
		liveVisitors: null,
		topProduct
	};
	analyticsCache.set(cacheKey, result);
	return result;
}

export async function getTrend(shop) {
	const session = await getShopSession(shop);
	const client = new shopify.clients.Graphql({
		session: { shop: session.shop, accessToken: session.accessToken }
	});
	const now = new Date();
	const days = 7;
	const trend = [];
	for (let i = days - 1; i >= 0; i--) {
		const day = new Date(now);
		day.setDate(now.getDate() - i);
		const start = day.toISOString().split('T')[0] + 'T00:00:00.000Z';
		const end = day.toISOString().split('T')[0] + 'T23:59:59.999Z';
		const orders = await fetchOrders(client, start, end);
		const sales = metrics.sales(orders);
		const orderCount = metrics.orders(orders);
		const aov = metrics.aov(orders);
		const topProduct = metrics.topProduct(orders);
		trend.push({
			date: day.toISOString().split('T')[0],
			sales: Number(sales.toFixed(2)),
			orders: orderCount,
			aov: Number(aov.toFixed(2)),
			topProduct
		});
	}
	return trend;
}

export async function getDayOverDay(shop) {
	const session = await getShopSession(shop);
	const client = new shopify.clients.Graphql({
		session: { shop: session.shop, accessToken: session.accessToken }
	});
	const now = new Date();
	// Today
	const todayStart = now.toISOString().split('T')[0] + 'T00:00:00.000Z';
	const todayEnd = now.toISOString().split('T')[0] + 'T23:59:59.999Z';
	const todayOrders = await fetchOrders(client, todayStart, todayEnd);
	// Yesterday
	const yest = new Date(now);
	yest.setDate(now.getDate() - 1);
	const yestStart = yest.toISOString().split('T')[0] + 'T00:00:00.000Z';
	const yestEnd = yest.toISOString().split('T')[0] + 'T23:59:59.999Z';
	const yestOrders = await fetchOrders(client, yestStart, yestEnd);
	// Metrics
	const todaySales = metrics.sales(todayOrders);
	const yestSales = metrics.sales(yestOrders);
	const todayOrdersCount = metrics.orders(todayOrders);
	const yestOrdersCount = metrics.orders(yestOrders);
	const todayAOV = metrics.aov(todayOrders);
	const yestAOV = metrics.aov(yestOrders);
	// Comparison
	const percent = (curr, prev) => prev === 0 ? null : ((curr - prev) / prev * 100).toFixed(2);
	return {
		sales: { today: todaySales, yesterday: yestSales, change: percent(todaySales, yestSales) },
		orders: { today: todayOrdersCount, yesterday: yestOrdersCount, change: percent(todayOrdersCount, yestOrdersCount) },
		aov: { today: todayAOV, yesterday: yestAOV, change: percent(todayAOV, yestAOV) }
	};
}

export async function getRange(shop, start, end) {
	if (!start || !end) throw new Error('Missing start or end date');
	const session = await getShopSession(shop);
	const client = new shopify.clients.Graphql({
		session: { shop: session.shop, accessToken: session.accessToken }
	});
	const orders = await fetchOrders(client, start, end);
	const sales = metrics.sales(orders);
	const orderCount = metrics.orders(orders);
	const aov = metrics.aov(orders);
	const topProducts = Object.values(orders.reduce((acc, order) => {
		order.lineItems.edges.forEach(item => {
			const prod = item.node.product;
			if (!prod) return;
			const revenue = parseFloat(item.node.discountedTotal) || 0;
			if (!acc[prod.id]) acc[prod.id] = { id: prod.id, title: prod.title, revenue: 0 };
			acc[prod.id].revenue += revenue;
		});
		return acc;
	}, {})).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
	return {
		sales: Number(sales.toFixed(2)),
		orders: orderCount,
		aov: Number(aov.toFixed(2)),
		topProducts
	};
}

export async function getTopProducts(shop, limit = 5) {
	limit = Math.max(1, Math.min(Number(limit), 20));
	const now = new Date();
	const start = now.toISOString().split('T')[0] + 'T00:00:00.000Z';
	const end = now.toISOString().split('T')[0] + 'T23:59:59.999Z';
	const session = await getShopSession(shop);
	const client = new shopify.clients.Graphql({
		session: { shop: session.shop, accessToken: session.accessToken }
	});
	const orders = await fetchOrders(client, start, end);
	const topProducts = Object.values(orders.reduce((acc, order) => {
		order.lineItems.edges.forEach(item => {
			const prod = item.node.product;
			if (!prod) return;
			const revenue = parseFloat(item.node.discountedTotal) || 0;
			if (!acc[prod.id]) acc[prod.id] = { id: prod.id, title: prod.title, revenue: 0 };
			acc[prod.id].revenue += revenue;
		});
		return acc;
	}, {})).sort((a, b) => b.revenue - a.revenue).slice(0, limit);
	return topProducts;
}

export async function getOrderStatus(shop) {
	const now = new Date();
	const start = now.toISOString().split('T')[0] + 'T00:00:00.000Z';
	const end = now.toISOString().split('T')[0] + 'T23:59:59.999Z';
	const session = await getShopSession(shop);
	const client = new shopify.clients.Graphql({
		session: { shop: session.shop, accessToken: session.accessToken }
	});
	const orders = await fetchOrders(client, start, end);
	const statusCounts = orders.reduce((acc, order) => {
		acc[order.financialStatus] = (acc[order.financialStatus] || 0) + 1;
		acc[order.fulfillmentStatus] = (acc[order.fulfillmentStatus] || 0) + 1;
		return acc;
	}, {});
	return statusCounts;
}

export async function getCustomerInsights(shop) {
	const now = new Date();
	const start = now.toISOString().split('T')[0] + 'T00:00:00.000Z';
	const end = now.toISOString().split('T')[0] + 'T23:59:59.999Z';
	const session = await getShopSession(shop);
	const client = new shopify.clients.Graphql({
		session: { shop: session.shop, accessToken: session.accessToken }
	});
	const orders = await fetchOrders(client, start, end);
	const customerIds = orders.map(o => o.customer?.id).filter(Boolean);
	const uniqueCustomers = new Set(customerIds);
	// For demo, treat all as new (real logic would check DB or Shopify customer creation date)
	return {
		newCustomers: uniqueCustomers.size,
		returningCustomers: 0 // Placeholder
	};
}

export async function exportAnalytics(shop, format = 'json') {
	const now = new Date();
	const start = now.toISOString().split('T')[0] + 'T00:00:00.000Z';
	const end = now.toISOString().split('T')[0] + 'T23:59:59.999Z';
	const session = await getShopSession(shop);
	const client = new shopify.clients.Graphql({
		session: { shop: session.shop, accessToken: session.accessToken }
	});
	const orders = await fetchOrders(client, start, end);
	const data = orders.map(o => ({
		id: o.id,
		totalPrice: o.totalPrice,
		createdAt: o.createdAt,
		financialStatus: o.financialStatus,
		fulfillmentStatus: o.fulfillmentStatus
	}));
	if (format === 'csv') {
		// You may want to use a CSV library here
		return data.map(row => Object.values(row).join(',')).join('\n');
	}
	return data;
}
