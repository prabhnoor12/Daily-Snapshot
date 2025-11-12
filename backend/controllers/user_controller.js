
import { asyncHandler } from '../utils/asyncHandler.js';
import prisma from '../config/prisma.js';
import * as userService from '../services/userService.js';
import crypto from 'crypto';
import { redis, checkAndRefreshRedisConnection } from '../config/redis.js';

function userResponse(data, error = null) {
	return { success: !error, data, error };
}

function logUserAction(action, details) {
	// Add more detailed logging, including correlationId if present
	console.log(`[User] ${action}:`, details);
}

// Helper for consistent error formatting
function formatError(message, code = 400, details = null) {
	return { error: { message, code, details } };
}

// Helper for role-based access control
function checkRole(req, allowedRoles) {
	const userRole = req.user?.role;
	if (!allowedRoles.includes(userRole)) {
		throw { status: 403, message: 'Forbidden: insufficient role' };
	}
}

// Helper for request tracing
function getCorrelationId(req) {
	return req.headers['x-correlation-id'] || crypto.randomUUID();
}

// Controller delegates validation and business logic to the service layer

// Create user
export const createUser = asyncHandler(async (req, res) => {
	const correlationId = getCorrelationId(req);
	try {
		checkRole(req, ['admin', 'manager']);
		const newUser = await userService.createUser(req.body);
		logUserAction('create', { id: newUser.id, email: newUser.email, correlationId });
		res.status(201).json({ data: newUser, correlationId });
	} catch (err) {
		if (err.message === 'Invalid user data') {
			return res.status(400).json(formatError(err.message, 400));
		}
		if (err.message === 'User already exists') {
			return res.status(409).json(formatError(err.message, 409));
		}
		const status = err.status || 500;
		res.status(status).json(formatError(err.message || 'Internal error', status));
	}
});

// Get user by ID
export const getUser = asyncHandler(async (req, res) => {
	const correlationId = getCorrelationId(req);
	try {
		checkRole(req, ['admin', 'manager', 'user']);
        const foundUser = await userService.getUser(req.params.id);
        logUserAction('get', { id: foundUser.id, correlationId });
        // If user is found and not deleted, return 200
        res.status(200).json({ data: foundUser, correlationId });
	} catch (err) {
		if (err.message === 'User not found') {
			return res.status(404).json(formatError(err.message, 404));
		}
		const status = err.status || 500;
		res.status(status).json(formatError(err.message || 'Internal error', status));
	}
});

// Update user
export const updateUser = asyncHandler(async (req, res) => {
	const correlationId = getCorrelationId(req);
	try {
		checkRole(req, ['admin', 'manager']);
        const updatedUser = await userService.updateUser(req.params.id, req.body);
        logUserAction('update', { id: req.params.id, updateData: req.body, correlationId });
        // If user is updated and not deleted, return 200
        res.status(200).json({ data: updatedUser, correlationId });
	} catch (err) {
		if (err.message === 'Invalid user update data') {
			return res.status(400).json(formatError(err.message, 400));
		}
		if (err.message === 'Email already in use') {
            return res.status(409).json(formatError(err.message, 409));
		}
		if (err.message === 'User not found') {
            return res.status(404).json(formatError(err.message, 404));
		}
		const status = err.status || 500;
		res.status(status).json(formatError(err.message || 'Internal error', status));
	}
});

// Delete user
export const deleteUser = asyncHandler(async (req, res) => {
	const correlationId = getCorrelationId(req);
	try {
		checkRole(req, ['admin']);
		await userService.deleteUser(req.params.id);
		logUserAction('delete', { id: req.params.id, correlationId });
		res.status(204).json({ correlationId });
	} catch (err) {
		if (err.message === 'User not found') {
			return res.status(404).json(formatError(err.message, 404));
		}
		const status = err.status || 500;
		res.status(status).json(formatError(err.message || 'Internal error', status));
	}
});

// List users
export const listUsers = asyncHandler(async (req, res) => {
	const correlationId = getCorrelationId(req);
	try {
		checkRole(req, ['admin', 'manager']);
		let { limit = 20, offset = 0, sort = 'id', order = 'asc', email, name, role } = req.query;
		limit = Math.max(1, Math.min(Number(limit), 100));
		offset = Math.max(0, Number(offset));
		const where = { deletedAt: null };
		if (email) where.email = { contains: email.toLowerCase() };
		if (name) where.name = { contains: name };
		if (role) where.role = role;
		const users = await prisma.user.findMany({
			where,
			skip: offset,
			take: limit,
			orderBy: { [sort]: order },
		});
		logUserAction('list', { filter: { email, name, role }, correlationId });
		res.json({ data: users, correlationId });
	} catch (err) {
		const status = err.status || 500;
		res.status(status).json(formatError(err.message || 'Internal error', status));
	}
});
