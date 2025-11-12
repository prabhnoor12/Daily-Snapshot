import prisma from '../config/prisma.js';
import { z } from 'zod';

const allowedRoles = ['admin', 'user', 'manager'];
const userSchema = z.object({
	email: z.string().email(),
	name: z.string().min(1),
	role: z.string().optional().refine(val => !val || allowedRoles.includes(val), {
		message: `Role must be one of: ${allowedRoles.join(', ')}`
	})
});

export async function createUser(data) {
	const createParsed = userSchema.safeParse(data);
	if (!createParsed.success) {
		throw new Error('Invalid user data');
	}
	let { email, name, role } = createParsed.data;
	email = email.toLowerCase();
	const existingUser = await prisma.user.findUnique({ where: { email } });
	console.log('[userService.createUser] existingUser:', existingUser);
    // If user exists and is not deleted, block creation
    if (existingUser && (!('deletedAt' in existingUser) || existingUser.deletedAt === null)) {
        throw new Error('User already exists');
    }
    // If user does not exist or is deleted, allow creation
    return await prisma.user.create({ data: { email, name, role } });
}

export async function getUser(id) {
	const foundUser = await prisma.user.findUnique({ where: { id: Number(id) } });
	console.log('[userService.getUser] foundUser:', foundUser);
    // If not found, or deletedAt is set (not null), treat as not found
    if (!foundUser || (foundUser.deletedAt && foundUser.deletedAt !== null)) {
        throw new Error('User not found');
    }
    return foundUser;
}

export async function updateUser(id, data) {
	const updateParsed = userSchema.partial().safeParse(data);
	if (!updateParsed.success) {
		throw new Error('Invalid user update data');
	}
	const updateData = {};
	if (updateParsed.data.email) {
		updateData.email = updateParsed.data.email.toLowerCase();
		const existingUser = await prisma.user.findUnique({ where: { email: updateData.email } });
		console.log('[userService.updateUser] existingUserForEmail:', existingUser);
        if (existingUser && existingUser.id !== Number(id) && (!('deletedAt' in existingUser) || existingUser.deletedAt === null)) {
            throw new Error('Email already in use');
        }
	}
	if (updateParsed.data.name) updateData.name = updateParsed.data.name;
	if (updateParsed.data.role) updateData.role = updateParsed.data.role;
	const updatedUser = await prisma.user.update({
		where: { id: Number(id) },
		data: updateData,
	}).catch((err) => {
		if (err.code === 'P2025') return null;
		throw err;
	});
	console.log('[userService.updateUser] updatedUser result:', updatedUser);
    // If not found, or deletedAt is set (not null), treat as not found
    if (!updatedUser || (updatedUser.deletedAt && updatedUser.deletedAt !== null)) {
        throw new Error('User not found');
    }
    return updatedUser;
}

export async function deleteUser(id) {
	const deletedUser = await prisma.user.update({
		where: { id: Number(id) },
		data: { deletedAt: new Date() },
	}).catch((err) => {
		if (err.code === 'P2025') return null;
		throw err;
	});
	if (!deletedUser) {
		throw new Error('User not found');
	}
	return deletedUser;
}

export async function listUsers(limit = 20, offset = 0) {
	limit = Math.max(1, Math.min(Number(limit), 100));
	offset = Math.max(0, Number(offset));
	return await prisma.user.findMany({
		where: { deletedAt: null },
		skip: offset,
		take: limit,
		orderBy: { id: 'asc' }
	});
}
