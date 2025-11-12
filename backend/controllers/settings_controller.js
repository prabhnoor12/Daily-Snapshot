import prisma from '../config/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { BadRequestError, UnauthorizedError, ForbiddenError } from '../utils/apiError.js';
import { z } from 'zod';
import { redis, checkAndRefreshRedisConnection } from '../config/redis.js';

// Zod schema for settings
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

// Access control middleware (admin only)
function requireAdmin(req, res, next) {
    if (!req.user || req.user.role !== 'admin') {
        throw new ForbiddenError('Admin access required');
    }
    next();
}

// Audit log helper
function logSettingAction(action, details) {
    console.log(`[Setting] ${action}:`, details);
}

// Helper function to upsert a single setting
async function upsertSetting(settingData) {
    const parsed = settingSchema.safeParse(settingData);
    if (!parsed.success) {
        const details = parsed.error.issues || parsed.error.errors;
        throw new BadRequestError('Invalid input', details);
    }

    const { key, value, type } = parsed.data;
    const valueString = JSON.stringify(value);

    const updated = await prisma.setting.upsert({
        where: { key },
        update: { value: valueString, type },
        create: { key, value: valueString, type }
    });

    logSettingAction('upsert', { key, value, type });
    return updated;
}

// Get all settings (with optional caching)
export const getSettings = asyncHandler(async (req, res) => {
    const settings = await prisma.setting.findMany({ where: { deletedAt: null } });
    res.json(new ApiResponse(200, settings));
});

// Get a single setting by key
export const getSetting = asyncHandler(async (req, res) => {
    const { key } = req.params;
    const setting = await prisma.setting.findUnique({ where: { key } });
    if (!setting || setting.deletedAt) {
        throw new BadRequestError('Setting not found');
    }
    // If key is 'appearance', return only the language property for frontend
    if (key === 'appearance') {
        let value = setting.value;
        if (typeof value === 'string') {
            try {
                value = JSON.parse(value);
            } catch {}
        }
        return res.json({ language: value.language || 'en' });
    }
    res.json(new ApiResponse(200, setting));
});

// Update a setting by key (admin only)
export const updateSetting = [requireAdmin, asyncHandler(async (req, res) => {
    const { key } = req.params;
    const updated = await upsertSetting({ key, ...req.body });
    res.json(new ApiResponse(200, updated));
})];

// Bulk update settings (admin only)
export const bulkUpdateSettings = [requireAdmin, asyncHandler(async (req, res) => {
    const { settings } = req.body;
    if (!Array.isArray(settings)) {
        throw new BadRequestError('Settings must be an array');
    }

    const promises = settings.map(s =>
        upsertSetting(s)
            .then(data => ({ key: s.key, success: true, data }))
            .catch(error => ({ key: s.key, error: error.errors || error.message }))
    );

    const results = await Promise.all(promises);

    res.json(new ApiResponse(200, results));
})];

// Delete a setting by key (soft delete, admin only)
export const deleteSetting = [requireAdmin, asyncHandler(async (req, res) => {
    const { key } = req.params;
    const deleted = await prisma.setting.update({
        where: { key },
        data: { deletedAt: new Date() }
    });
    logSettingAction('delete', { key });
    res.status(204).json(new ApiResponse(204, null, 'Deleted'));
})];
