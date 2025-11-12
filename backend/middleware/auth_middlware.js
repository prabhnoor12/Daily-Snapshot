import jwt from 'jsonwebtoken';
import shopify from '../config/shopify.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { UnauthorizedError, ForbiddenError } from '../utils/apiError.js';


const clientCache = new Map();

const verifyAuth = asyncHandler(async (req, res, next) => {
    const prisma = (await import('../config/prisma.js')).default;
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET, {
            audience: process.env.JWT_AUDIENCE,
            issuer: process.env.JWT_ISSUER,
            maxAge: '15m', // Short-lived token
        });
        const shopDomain = decoded.shop;

        if (!shopDomain) {
            throw new ForbiddenError('Invalid token payload');
        }

        // Load the shop's offline access token from our database
        const shop = await prisma.shop.findUnique({ where: { shop: shopDomain } });
        if (!shop || !shop.accessToken) {
            throw new UnauthorizedError('Could not find a valid session for this shop');
        }

        // Create a temporary session object for the GraphQL client
        const session = {
            shop: shop.shop,
            accessToken: shop.accessToken,
        };

        // Attach a ready-to-use Shopify GraphQL client to the response locals
        res.locals.shopify = {
            session: session,
            client: new shopify.clients.Graphql({ session }),
        };

        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new UnauthorizedError('Token has expired');
        }
        if (error instanceof jwt.JsonWebTokenError) {
            throw new UnauthorizedError('Invalid or expired token');
        }
        throw error;
    }
});

export { verifyAuth };
