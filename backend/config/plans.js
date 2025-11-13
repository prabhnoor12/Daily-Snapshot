// Centralized plan configuration for billing

export const PRO_PLAN = {
    name: 'Pro',
    price: 20,
    trialDays: 14,
};

// Build a billing return URL for Shopify charge confirmation
// Priority: BILLING_RETURN_URL env -> APP_URL env -> localhost fallback
export function buildReturnUrl(shop) {
    const base = process.env.BILLING_RETURN_URL
        || process.env.APP_URL
        || 'https://daily-snapshot.onrender.com';
    const path = '/billing/confirm';
    const url = new URL(path, base);
    if (shop) url.searchParams.set('shop', shop);
    return url.toString();
}

export default {
    PRO_PLAN,
    buildReturnUrl,
};
