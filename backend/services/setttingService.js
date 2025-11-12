import prisma from '../config/prisma.js';
import { z } from 'zod';

const settingSchema = z.object({
	key: z.string().min(1).max(64).regex(/^[a-zA-Z0-9_.-]+$/),
	value: z.union([
		z.string(),
		z.number(),
		z.boolean(),
		z.object({}).passthrough(),
	]),
	type: z.enum(['string', 'number', 'boolean', 'json']).optional()
});

export async function getSettings() {
	return await prisma.setting.findMany({ where: { deletedAt: null } });
}

export async function getSetting(key) {
	return await prisma.setting.findUnique({ where: { key, deletedAt: null } });
}

export async function createOrUpdateSetting(data) {
	const parsed = settingSchema.safeParse(data);
	if (!parsed.success) throw new Error('Invalid setting data');
	const { key, value, type } = parsed.data;
	return await prisma.setting.upsert({
		where: { key },
		update: { value: JSON.stringify(value), type },
		create: { key, value: JSON.stringify(value), type },
	});
}

export async function updateSetting(key, data) {
	const parsed = settingSchema.safeParse({ key, ...data });
	if (!parsed.success) throw new Error('Invalid input');
	const { value, type } = parsed.data;
	return await prisma.setting.upsert({
		where: { key },
		update: { value: JSON.stringify(value), type },
		create: { key, value: JSON.stringify(value), type }
	});
}

export async function bulkUpdateSettings(settings) {
	if (!Array.isArray(settings)) throw new Error('Settings must be an array');
	const results = [];
	for (const s of settings) {
		const parsed = settingSchema.safeParse(s);
		if (!parsed.success) {
			results.push({ key: s.key, error: parsed.error.errors });
			continue;
		}
		const { key, value, type } = parsed.data;
		const updated = await prisma.setting.upsert({
			where: { key },
			update: { value: JSON.stringify(value), type },
			create: { key, value: JSON.stringify(value), type }
		});
		results.push({ key, success: true, data: updated });
	}
	return results;
}

export async function deleteSetting(key) {
	return await prisma.setting.update({
		where: { key },
		data: { deletedAt: new Date() },
	});
}
