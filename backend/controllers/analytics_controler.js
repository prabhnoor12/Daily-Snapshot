import shopify from '../config/shopify.js';
import prisma from '../config/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { BadRequestError, UnauthorizedError } from '../utils/apiError.js';
import { parseISO, format, subDays, startOfDay, endOfDay, differenceInCalendarDays } from 'date-fns';
import { Parser, Transform } from 'json2csv';
import NodeCache from 'node-cache';
import { withRetry } from '../utils/retry.js';
import { buildOrdersQuery, buildOrderLineItemsQuery, buildCustomersNodesQuery } from '../services/analytics/shopifyQueries.js';
import logger from '../utils/logger.js';
import { redis, checkAndRefreshRedisConnection } from '../config/redis.js';
// Caching: cache analytics responses for 60 seconds per shop
const analyticsCache = new NodeCache({ stdTTL: 60 });

// Test helper: allow clearing cache in test environment without exposing internals in production code paths
// Exported with a double underscore prefix to discourage accidental prod usage.
export function __clearAnalyticsCache() {
    analyticsCache.flushAll();
}

function logAnalyticsAction(action, details) {
    logger.info({ action, ...details }, 'analytics');
}

// Modular metrics
const metrics = {
    sales: orders => orders.reduce((sum, o) => sum + toNumber(o.totalPrice), 0),
    orders: orders => orders.length,
    aov: orders => orders.length > 0 ? orders.reduce((sum, o) => sum + toNumber(o.totalPrice), 0) / orders.length : 0,
    topProducts: (orders, limit = 1) => {
        const productSales = {};
        orders.forEach(order => {
            order.lineItems.forEach(item => {
                const prod = item.product;
                if (!prod) return;
                const revenue = toNumber(item.discountedTotal) * (item.quantity || 1);
                if (!productSales[prod.id]) {
                    productSales[prod.id] = { id: prod.id, title: prod.title, revenue: 0 };
                }
                productSales[prod.id].revenue += revenue;
            });
        });
        return Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, limit);
    }
};

function toNumber(v) {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
}

function formatCurrency(n) {
    return Number(toNumber(n).toFixed(2));
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

// Paginated fetch of orders + line items
async function fetchOrdersPaginated(client, start, end, { maxOrderPages = 10, maxLineItemPages = 5 } = {}) {
    let after = null;
    const orders = [];
    let pages = 0;
    let partial = false;
    while (pages < maxOrderPages) {
        pages++;
        const query = buildOrdersQuery({ start, end, after });
        const resp = await withRetry(() => client.query({ data: query }), { retries: 3, breakerKey: 'shopify' });
        const data = resp.body.data.orders;
        for (const edge of data.edges) {
            const node = edge.node;
            // Normalize line items with pagination
            let lineItems = edge.node.lineItems.edges.map(le => normalizeLineItem(le.node));
            let liAfter = edge.node.lineItems.pageInfo.endCursor;
            let liPages = 0;
            while (edge.node.lineItems.pageInfo.hasNextPage && liPages < maxLineItemPages) {
                liPages++;
                const liQuery = buildOrderLineItemsQuery({ orderId: node.id, after: liAfter });
                const liResp = await withRetry(() => client.query({ data: liQuery }), { retries: 2, breakerKey: 'shopify' });
                const liData = liResp.body.data.node.lineItems;
                lineItems.push(...liData.edges.map(le => normalizeLineItem(le.node)));
                if (!liData.pageInfo.hasNextPage) break;
                liAfter = liData.pageInfo.endCursor;
            }
            if (edge.node.lineItems.pageInfo.hasNextPage) {
                partial = true; // truncated line items
            }
            orders.push({
                id: node.id,
                totalPrice: node.totalPrice,
                createdAt: node.createdAt,
                financialStatus: node.financialStatus || 'UNKNOWN',
                fulfillmentStatus: node.fulfillmentStatus || 'UNFULFILLED',
                customerId: node.customer?.id || null,
                lineItems
            });
        }
        if (!data.pageInfo.hasNextPage) break;
        after = data.pageInfo.endCursor;
    }
    if (pages === maxOrderPages) partial = true; // truncated orders
    return { orders, partial };
}

function normalizeLineItem(node) {
    return {
        product: node.product ? { id: node.product.id, title: node.product.title } : null,
        quantity: node.quantity || 1,
        discountedTotal: node.discountedTotal
    };
}

// Main analytics endpoint with caching, error reporting, and modular metrics
export const getDailySnapshot = asyncHandler(async (req, res) => {
    const { shop } = req.user;
    // Security: audit access
    logger.info({ action: 'access', shop, user: req.user.id }, 'analytics');
    // Rate limiting can be added in route middleware
    // Caching
    const cacheKey = `snapshot:${shop}`;
    const cached = analyticsCache.get(cacheKey);
    if (cached) {
        logger.info({ action: 'cache_hit', shop }, 'analytics');
        return res.json(new ApiResponse(200, cached));
    }
    const session = await getShopSession(shop);
    const client = new shopify.clients.Graphql({
        session: {
            shop: session.shop,
            accessToken: session.accessToken
        }
    });
    // Get today's date range in UTC
    const now = new Date();
    const start = startOfDay(now).toISOString();
    const end = endOfDay(now).toISOString();

    // Performance: use bulk API for large stores (not implemented, placeholder)
    // Shopify webhooks can be used for real-time updates (future enhancement)

    // 1. Fetch today's orders paginated
    let orders = [];
    let partial = false;
    try {
        const paged = await fetchOrdersPaginated(client, start, end);
        orders = paged.orders;
        partial = paged.partial;
    } catch (err) {
        logger.error({ action: 'orders_failed', shop, error: err.message, code: err.code }, 'analytics');
        return res.status(502).json(new ApiResponse(502, null, 'Failed to fetch orders'));
    }
    // 2. Calculate metrics modularly
    const sales = metrics.sales(orders);
    const orderCount = metrics.orders(orders);
    const aov = metrics.aov(orders);
    const topProduct = metrics.topProducts(orders, 1)[0] || null;

    // 3. Fetch live visitors (not available in standard API)
    let liveVisitors = null;
    // ...existing code...

    // 4. Build response
    const result = {
        sales: formatCurrency(sales),
        orders: orderCount,
        aov: formatCurrency(aov),
        liveVisitors,
        topProduct,
        partial
    };
    analyticsCache.set(cacheKey, result);
    logger.info({ action: 'snapshot', shop, result }, 'analytics');
    res.json(new ApiResponse(200, result));
});

// 1. Historical Mini-Charts (7-day trend)
export const getTrend = asyncHandler(async (req, res) => {
    const { shop } = req.user;
    const session = await getShopSession(shop);
    const client = new shopify.clients.Graphql({
        session: { shop: session.shop, accessToken: session.accessToken }
    });
    const now = new Date();
    const days = 7;
    const trend = [];
    // Cache
    const cacheKey = `trend:${shop}:7d`;
    const cached = analyticsCache.get(cacheKey);
    if (cached) return res.json(new ApiResponse(200, cached));

    const fetchPromises = [];
    for (let i = days - 1; i >= 0; i--) {
        const day = subDays(now, i);
        const start = startOfDay(day).toISOString();
        const end = endOfDay(day).toISOString();
        fetchPromises.push(fetchOrdersPaginated(client, start, end));
    }
    const dayResults = await Promise.all(fetchPromises);
    dayResults.forEach((paged, idx) => {
        const day = subDays(now, days - 1 - idx);
        const orders = paged.orders;
        const sales = metrics.sales(orders);
        const orderCount = metrics.orders(orders);
        const aov = metrics.aov(orders);
        const topProduct = metrics.topProducts(orders, 1)[0] || null;
        trend.push({
            date: format(day, 'yyyy-MM-dd'),
            sales: formatCurrency(sales),
            orders: orderCount,
            aov: formatCurrency(aov),
            topProduct,
            partial: paged.partial
        });
    });
    analyticsCache.set(cacheKey, trend);
    res.json(new ApiResponse(200, trend));
});

// 2. Day-over-Day Comparison
export const getDayOverDay = asyncHandler(async (req, res) => {
    const { shop } = req.user;
    const session = await getShopSession(shop);
    const client = new shopify.clients.Graphql({
        session: { shop: session.shop, accessToken: session.accessToken }
    });
    const now = new Date();
    // Today
    const todayStart = startOfDay(now).toISOString();
    const todayEnd = endOfDay(now).toISOString();
    const todayPaged = await fetchOrdersPaginated(client, todayStart, todayEnd);
    const todayOrders = todayPaged.orders;
    // Yesterday
    const yest = subDays(now, 1);
    const yestStart = startOfDay(yest).toISOString();
    const yestEnd = endOfDay(yest).toISOString();
    const yestPaged = await fetchOrdersPaginated(client, yestStart, yestEnd);
    const yestOrders = yestPaged.orders;
    // Metrics
    const todaySales = metrics.sales(todayOrders);
    const yestSales = metrics.sales(yestOrders);
    const todayOrdersCount = metrics.orders(todayOrders);
    const yestOrdersCount = metrics.orders(yestOrders);
    const todayAOV = metrics.aov(todayOrders);
    const yestAOV = metrics.aov(yestOrders);
    // Comparison
    const percent = (curr, prev) => prev === 0 ? null : ((curr - prev) / prev * 100).toFixed(2);
    const result = {
        sales: { today: formatCurrency(todaySales), yesterday: formatCurrency(yestSales), change: percent(todaySales, yestSales) },
        orders: { today: todayOrdersCount, yesterday: yestOrdersCount, change: percent(todayOrdersCount, yestOrdersCount) },
        aov: { today: formatCurrency(todayAOV), yesterday: formatCurrency(yestAOV), change: percent(todayAOV, yestAOV) },
        partial: todayPaged.partial || yestPaged.partial
    };
    res.json(new ApiResponse(200, result));
});

// 3. Custom Date Range
export const getRange = asyncHandler(async (req, res) => {
    const { shop } = req.user;
    let { start, end } = req.query;
    if (!start || !end) throw new BadRequestError('Missing start or end date');
    start = startOfDay(parseISO(start)).toISOString();
    end = endOfDay(parseISO(end)).toISOString();
    // Range cap: max 90 days
    let partial = false;
    const daySpan = differenceInCalendarDays(new Date(end), new Date(start)) + 1;
    if (daySpan > 90) {
        const cappedEnd = endOfDay(subDays(parseISO(start), -89)).toISOString();
        end = cappedEnd;
        partial = true;
    }
    const session = await getShopSession(shop);
    const client = new shopify.clients.Graphql({
        session: { shop: session.shop, accessToken: session.accessToken }
    });
    const { orders, partial: fetchPartial } = await fetchOrdersPaginated(client, start, end);
    const sales = metrics.sales(orders);
    const orderCount = metrics.orders(orders);
    const aov = metrics.aov(orders);
    const topProducts = metrics.topProducts(orders, 5);
    res.json(new ApiResponse(200, {
        sales: formatCurrency(sales),
        orders: orderCount,
        aov: formatCurrency(aov),
        topProducts,
        partial: partial || fetchPartial
    }));
});

// 4. Product Breakdown (top N products)
export const getTopProducts = asyncHandler(async (req, res) => {
    const { shop } = req.user;
    let { limit = 5 } = req.query;
    limit = Math.max(1, Math.min(Number(limit), 20));
    const now = new Date();
    const start = startOfDay(now).toISOString();
    const end = endOfDay(now).toISOString();
    const session = await getShopSession(shop);
    const client = new shopify.clients.Graphql({
        session: { shop: session.shop, accessToken: session.accessToken }
    });
    const cacheKey = `top:${shop}:${limit}`;
    const cached = analyticsCache.get(cacheKey);
    if (cached) return res.json(new ApiResponse(200, cached));

    const { orders, partial } = await fetchOrdersPaginated(client, start, end);
    const topProducts = metrics.topProducts(orders, limit);
    const resp = { topProducts, partial };
    analyticsCache.set(cacheKey, resp);
    res.json(new ApiResponse(200, resp));
});

// 5. Order Status Breakdown
export const getOrderStatus = asyncHandler(async (req, res) => {
    const { shop } = req.user;
    const now = new Date();
    const start = startOfDay(now).toISOString();
    const end = endOfDay(now).toISOString();
    const session = await getShopSession(shop);
    const client = new shopify.clients.Graphql({
        session: { shop: session.shop, accessToken: session.accessToken }
    });
    const cacheKey = `status:${shop}`;
    const cached = analyticsCache.get(cacheKey);
    if (cached) return res.json(new ApiResponse(200, cached));

    const { orders, partial } = await fetchOrdersPaginated(client, start, end);
    const financial = {};
    const fulfillment = {};
    orders.forEach(order => {
        if (order.financialStatus) financial[order.financialStatus] = (financial[order.financialStatus] || 0) + 1;
        if (order.fulfillmentStatus) fulfillment[order.fulfillmentStatus] = (fulfillment[order.fulfillmentStatus] || 0) + 1;
    });
    const resp = { financial, fulfillment, partial };
    analyticsCache.set(cacheKey, resp);
    res.json(new ApiResponse(200, resp));
});

// 6. Customer Insights
export const getCustomerInsights = asyncHandler(async (req, res) => {
    const { shop } = req.user;
    const now = new Date();
    const start = startOfDay(now).toISOString();
    const end = endOfDay(now).toISOString();
    const session = await getShopSession(shop);
    const client = new shopify.clients.Graphql({
        session: { shop: session.shop, accessToken: session.accessToken }
    });
    const { orders, partial } = await fetchOrdersPaginated(client, start, end);
    const customerIds = [...new Set(orders.map(o => o.customerId).filter(Boolean))];
    let newCount = 0;
    let returningCount = 0;
    if (customerIds.length) {
        const batchQuery = buildCustomersNodesQuery(customerIds.slice(0, 50)); // limit batch size
        try {
            const resp = await withRetry(() => client.query({ data: batchQuery }), { retries: 2, breakerKey: 'shopify' });
            const nodes = resp.body.data.nodes.filter(Boolean);
            nodes.forEach(n => {
                if (!n.createdAt) return;
                const created = new Date(n.createdAt);
                if (created >= startOfDay(new Date())) newCount++; else returningCount++;
            });
        } catch (e) {
            logAnalyticsAction('customer_nodes_failed', { shop, error: e.message });
            // Fallback: treat all as new
            newCount = customerIds.length;
        }
    }
    res.json(new ApiResponse(200, {
        newCustomers: newCount,
        returningCustomers: returningCount,
        partial
    }));
});

// 7. Export Data
export const exportAnalytics = asyncHandler(async (req, res) => {
    const { shop } = req.user;
    let { format = 'json' } = req.query;
    const now = new Date();
    const start = startOfDay(now).toISOString();
    const end = endOfDay(now).toISOString();
    const session = await getShopSession(shop);
    const client = new shopify.clients.Graphql({
        session: { shop: session.shop, accessToken: session.accessToken }
    });
    const { orders, partial } = await fetchOrdersPaginated(client, start, end, { maxOrderPages: 20 });
    const data = orders.map(o => ({
        id: o.id,
        totalPrice: formatCurrency(o.totalPrice),
        createdAt: o.createdAt,
        financialStatus: o.financialStatus,
        fulfillmentStatus: o.fulfillmentStatus
    }));
    if (format === 'csv') {
        res.header('Content-Type', 'text/csv');
        const transform = new Transform({}, {}, {});
        transform.on('error', err => logAnalyticsAction('csv_error', { shop, error: err.message }));
        data.forEach(row => transform.write(row));
        transform.end();
        return transform.pipe(res);
    }
    res.json(new ApiResponse(200, { data, partial }));
});

// 8. Simple Forecast (7-day moving average over last 30 days)
export const getForecast = asyncHandler(async (req, res) => {
    const { shop } = req.user;
    const session = await getShopSession(shop);
    const client = new shopify.clients.Graphql({ session: { shop: session.shop, accessToken: session.accessToken } });
    const now = new Date();
    // collect last 30 days sales
    const days = 30;
    const promises = [];
    for (let i = days; i >= 1; i--) {
        const day = subDays(now, i);
        const start = startOfDay(day).toISOString();
        const end = endOfDay(day).toISOString();
        promises.push(fetchOrdersPaginated(client, start, end));
    }
    const results = await Promise.all(promises);
    const dailySales = results.map((r, idx) => {
        const day = subDays(now, days - idx);
        return { date: format(day, 'yyyy-MM-dd'), sales: metrics.sales(r.orders) };
    });
    // moving average window 7
    const window = 7;
    const avg = (arr, i) => {
        const start = Math.max(0, i - window + 1);
        const slice = arr.slice(start, i + 1).map(x => x.sales);
        return slice.reduce((a, b) => a + b, 0) / slice.length;
    };
    const lastAvg = avg(dailySales, dailySales.length - 1);
    const forecast = [];
    for (let i = 1; i <= 7; i++) {
        const day = subDays(now, -i);
        forecast.push({ date: format(day, 'yyyy-MM-dd'), predictedSales: formatCurrency(lastAvg) });
    }
    res.json(new ApiResponse(200, { forecast }));
});

// 9. Anomaly Detection (z-score over last 30 days)
export const getAnomalies = asyncHandler(async (req, res) => {
    const { shop } = req.user;
    const session = await getShopSession(shop);
    const client = new shopify.clients.Graphql({ session: { shop: session.shop, accessToken: session.accessToken } });
    const now = new Date();
    const days = 30;
    const promises = [];
    for (let i = days; i >= 1; i--) {
        const day = subDays(now, i);
        const start = startOfDay(day).toISOString();
        const end = endOfDay(day).toISOString();
        promises.push(fetchOrdersPaginated(client, start, end));
    }
    const results = await Promise.all(promises);
    const values = results.map(r => metrics.sales(r.orders));
    const mean = values.reduce((a, b) => a + b, 0) / Math.max(1, values.length);
    const variance = values.reduce((a, v) => a + Math.pow(v - mean, 2), 0) / Math.max(1, values.length);
    const std = Math.sqrt(variance);
    const anomalies = [];
    results.forEach((r, idx) => {
        const day = subDays(now, days - idx);
        const sales = values[idx];
        const z = std > 0 ? (sales - mean) / std : 0;
        if (Math.abs(z) >= 2) {
            anomalies.push({ date: format(day, 'yyyy-MM-dd'), sales: formatCurrency(sales), zScore: Number(z.toFixed(2)) });
        }
    });
    res.json(new ApiResponse(200, { anomalies, mean: formatCurrency(mean), std: formatCurrency(std) }));
});
