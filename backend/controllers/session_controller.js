
import { asyncHandler } from '../utils/asyncHandler.js';
import prisma from '../config/prisma.js';
import { ApiError } from '../utils/apiError.js';
import { redis, checkAndRefreshRedisConnection } from '../config/redis.js';

function logSessionAction(action, details) {
	console.log(`[Session] ${action}:`, details);
}

// List all sessions
export const listSessions = asyncHandler(async (req, res) => {
	const sessions = await prisma.session.findMany();
	logSessionAction('list', { count: sessions.length });
	res.json(sessions);
});

// Get session by ID
export const getSession = asyncHandler(async (req, res) => {
	const { id } = req.params;
	const session = await prisma.session.findUnique({ where: { id } });
	if (!session) {
		throw new ApiError(404, 'Session not found');
	}
	logSessionAction('get', { id });
	res.json(session);
});

// Create or update session
export const upsertSession = asyncHandler(async (req, res) => {
	const { id, content, shop } = req.body;
	if (!id || !content || !shop) {
		throw new ApiError(400, 'Missing required session fields');
	}
	const session = await prisma.session.upsert({
		where: { id },
		update: { content, shop },
		create: { id, content, shop },
	});
	logSessionAction('upsert', { id, shop });
	res.status(201).json(session);
});

// Delete session by ID
export const deleteSession = asyncHandler(async (req, res) => {
	const { id } = req.params;
	await prisma.session.delete({ where: { id } }).catch((err) => {
		if (err.code === 'P2025') throw new ApiError(404, 'Session not found');
		throw err;
	});
	logSessionAction('delete', { id });
	res.status(204).send();
});

// Validate session (e.g., check expiry)
export const validateSession = asyncHandler(async (req, res) => {
	const { id } = req.params;
	const session = await prisma.session.findUnique({ where: { id } });
	if (!session) {
		throw new ApiError(404, 'Session not found');
	}
	let valid = true;
	let reason = 'valid';
	try {
		const sessionData = JSON.parse(session.content);
		if (sessionData.expires && new Date(sessionData.expires) < new Date()) {
			valid = false;
			reason = 'expired';
		}
	} catch {
		// If parsing fails, treat as invalid
		valid = false;
		reason = 'invalid content';
	}
	logSessionAction('validate', { id, valid, reason });
	if (!valid) {
		throw new ApiError(401, `Session ${reason}`);
	}
	res.json({ valid: true, session });
});
