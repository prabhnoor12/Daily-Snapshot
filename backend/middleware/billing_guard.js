import { UnauthorizedError, ForbiddenError } from '../utils/apiError.js';
import { PRO_PLAN } from '../config/plans.js';

// Lazy import prisma to avoid circular deps in some test setups
async function getPrisma() {
  const prisma = (await import('../config/prisma.js')).default;
  return prisma;
}

function getShopFromReq(req, res) {
  const shop = req.user?.shop || res.locals?.shopify?.session?.shop;
  return shop;
}

// Determines if the shop has an active subscription or is within trial window
async function hasActiveOrTrial(prisma, shop) {
  const sub = await prisma.subscription.findFirst({
    where: { shop, cancelledAt: null },
    orderBy: { createdAt: 'desc' },
  });
  if (!sub) return false;
  // Consider these statuses valid access
  const activeStatuses = ['active', 'accepted', 'pending'];
  if (activeStatuses.includes((sub.status || '').toLowerCase())) return true;
  // Fallback: grace window based on createdAt and trialDays
  const created = new Date(sub.createdAt || Date.now());
  const now = new Date();
  const ms = now.getTime() - created.getTime();
  const days = ms / (1000 * 60 * 60 * 24);
  return days <= (PRO_PLAN.trialDays + 2); // small grace
}

export const billingGuard = async (req, res, next) => {
  try {
    // Bypass in tests
    if (process.env.NODE_ENV === 'test') return next();
    const shop = getShopFromReq(req, res);
    if (!shop) throw new UnauthorizedError('Shop not identified');
    const prisma = await getPrisma();
    const ok = await hasActiveOrTrial(prisma, shop);
    if (!ok) {
      throw new ForbiddenError('Subscription required');
    }
    next();
  } catch (err) {
    next(err);
  }
};

export default billingGuard;
