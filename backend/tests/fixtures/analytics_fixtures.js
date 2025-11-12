// Analytics fixtures to simulate Shopify GraphQL orders
// Exported as CommonJS for easy interop with Vitest ESM tests

// Helper to create a line item node
function makeLineItem(productId, title, quantity, discountedTotal) {
  return {
    node: {
      product: { id: productId, title },
      quantity,
      discountedTotal: String(discountedTotal)
    }
  };
}

// Helper to create an order node consistent with controller expectations
function makeOrder({ id, totalPrice, createdAt, financialStatus = 'PAID', fulfillmentStatus = 'FULFILLED', customerId = null, lineItems = [] }) {
  return {
    id: id || `gid://shopify/Order/${Math.floor(Math.random() * 100000)}`,
    totalPrice: String(totalPrice ?? 0),
    createdAt: createdAt || new Date().toISOString(),
    financialStatus,
    fulfillmentStatus,
    customer: customerId ? { id: customerId } : null,
    lineItems: {
      first: 50,
      edges: lineItems
    }
  };
}

// Build a GraphQL-like response body for the given array of orders
function buildOrdersGraphQLResponse(ordersArray) {
  return {
    body: {
      data: {
        orders: {
          edges: ordersArray.map(o => ({ node: o }))
        }
      }
    }
  };
}

// Sample products
const PROD_A = 'gid://shopify/Product/1';
const PROD_B = 'gid://shopify/Product/2';

// Today orders: two orders, product A dominates
const todayOrders = [
  makeOrder({
    id: 'gid://shopify/Order/1001',
    totalPrice: '120.00',
    financialStatus: 'PAID',
    fulfillmentStatus: 'FULFILLED',
    customerId: 'gid://shopify/Customer/11',
    lineItems: [
      makeLineItem(PROD_A, 'Alpha', 1, 30),
      makeLineItem(PROD_B, 'Bravo', 1, 20)
    ]
  }),
  makeOrder({
    id: 'gid://shopify/Order/1002',
    totalPrice: '80.00',
    financialStatus: 'PAID',
    fulfillmentStatus: 'UNFULFILLED',
    customerId: 'gid://shopify/Customer/22',
    lineItems: [
      makeLineItem(PROD_A, 'Alpha', 2, 50)
    ]
  })
];

// Yesterday orders: product B small revenue
const yesterdayOrders = [
  makeOrder({
    id: 'gid://shopify/Order/9001',
    totalPrice: '10.00',
    financialStatus: 'PAID',
    fulfillmentStatus: 'FULFILLED',
    customerId: 'gid://shopify/Customer/33',
    lineItems: [ makeLineItem(PROD_B, 'Bravo', 1, 10) ]
  })
];

// Mixed orders for range/status tests
const mixedOrders = [
  makeOrder({
    id: 'gid://shopify/Order/7001',
    totalPrice: '50.00',
    financialStatus: 'PENDING',
    fulfillmentStatus: 'UNFULFILLED',
    customerId: 'gid://shopify/Customer/44',
    lineItems: [ makeLineItem(PROD_A, 'Alpha', 1, 25) ]
  }),
  makeOrder({
    id: 'gid://shopify/Order/7002',
    totalPrice: '75.00',
    financialStatus: 'PAID',
    fulfillmentStatus: 'FULFILLED',
    customerId: 'gid://shopify/Customer/44', // Same customer (returning)
    lineItems: [ makeLineItem(PROD_B, 'Bravo', 3, 60) ]
  })
];

module.exports = {
  makeOrder,
  makeLineItem,
  buildOrdersGraphQLResponse,
  todayOrders,
  yesterdayOrders,
  mixedOrders,
  PROD_A,
  PROD_B
};
