// Query builders for Shopify GraphQL Admin API

export function buildOrdersQuery({ start, end, after }) {
  const afterArg = after ? `, after: \"${after}\"` : '';
  // Note: totalPrice can be string; we parse later
  return `{
    orders(first: 100, query: "created_at:>='${start}' created_at:<='${end}'", sortKey: CREATED_AT, reverse: true${afterArg}) {
      edges {
        cursor
        node {
          id
          totalPrice
          createdAt
          financialStatus
          fulfillmentStatus
          customer { id }
          lineItems(first: 50) {
            edges {
              cursor
              node {
                product { id title }
                quantity
                discountedTotal
              }
            }
            pageInfo { hasNextPage endCursor }
          }
        }
      }
      pageInfo { hasNextPage endCursor }
    }
  }`;
}

export function buildOrderLineItemsQuery({ orderId, after }) {
  const afterArg = after ? `, after: \"${after}\"` : '';
  return `query {
    node(id: "${orderId}") {
      ... on Order {
        id
        lineItems(first: 50${afterArg}) {
          edges {
            cursor
            node {
              product { id title }
              quantity
              discountedTotal
            }
          }
          pageInfo { hasNextPage endCursor }
        }
      }
    }
  }`;
}

export function buildCustomersNodesQuery(ids) {
  const idList = ids.map(id => `"${id}"`).join(',');
  return `query {
    nodes(ids: [${idList}]) {
      ... on Customer { id createdAt }
    }
  }`;
}
