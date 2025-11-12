// Recreated user tests (file was empty) with corrected syntax.
import { vi, describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import userFixtures from './fixtures/user_fixtures.js';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';

// Use hoisted mocks to avoid ReferenceError with other modules importing prisma before initialization
const hoisted = vi.hoisted(() => ({
	mockPrisma: {
		user: {
			findUnique: vi.fn(),
			create: vi.fn(),
			update: vi.fn(),
			findMany: vi.fn(),
		},
		shop: { findUnique: vi.fn() }
	}
}));
const { mockPrisma } = hoisted;

vi.mock('../config/prisma.js', () => ({ default: hoisted.mockPrisma }));

import app from '../main.js';

const { user1, user2, deletedUser, newUserPayload, updateUserPayload, invalidUserPayload } = userFixtures;

describe('User Controller', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		Object.values(mockPrisma.user).forEach(fn => fn.mockReset());
		mockPrisma.shop.findUnique.mockReset();
	});

	describe('createUser', () => {
		it('should create a new user', async () => {
			mockPrisma.user.findUnique.mockResolvedValue(null);
				// Ensure mock returned email matches the one we send so assertion is consistent
				mockPrisma.user.create.mockResolvedValue({ ...newUserPayload, id: 10, deletedAt: null, email: 'uniqueuser@example.com' });
			const res = await request(app).post('/api/users').send({ ...newUserPayload, email: 'uniqueuser@example.com' });
			expect(res.statusCode).toBe(201);
			expect(res.body.data.email).toBe('uniqueuser@example.com');
		});
		it('should not create user with invalid payload', async () => {
			mockPrisma.user.findUnique.mockResolvedValue(null);
			const res = await request(app).post('/api/users').send(invalidUserPayload);
			expect(res.statusCode).toBe(400);
			expect(res.body.error || res.body.message).toBeDefined();
		});
		it('should not create user if already exists', async () => {
			mockPrisma.user.findUnique.mockResolvedValue({ ...user1, deletedAt: null });
			const res = await request(app).post('/api/users').send({ ...user1, name: 'Another', email: user1.email });
			expect(res.statusCode).toBe(409);
		});
	});

	describe('getUser', () => {
		it('should get user by id', async () => {
			mockPrisma.user.findUnique.mockResolvedValue({ ...user1, id: 1, deletedAt: null });
			const res = await request(app).get('/api/users/1');
			expect(res.statusCode).toBe(200);
			expect(res.body.data.email).toBe(user1.email);
		});
		it('should return 404 for non-existent user', async () => {
			mockPrisma.user.findUnique.mockResolvedValue(null);
			const res = await request(app).get('/api/users/999');
			expect(res.statusCode).toBe(404);
		});
		it('should return 404 for deleted user', async () => {
			mockPrisma.user.findUnique.mockResolvedValue({ ...deletedUser, id: 3, deletedAt: new Date() });
			const res = await request(app).get('/api/users/3');
			expect(res.statusCode).toBe(404);
		});
	});

	describe('updateUser', () => {
		it('should update user details', async () => {
			mockPrisma.user.findUnique.mockResolvedValue({ ...user1, id: 1, deletedAt: null });
			mockPrisma.user.update.mockResolvedValue({ ...user1, ...updateUserPayload, id: 1, deletedAt: null });
			const res = await request(app).put('/api/users/1').send(updateUserPayload);
			expect(res.statusCode).toBe(200);
			expect(res.body.data.name).toBe(updateUserPayload.name);
		});
		it('should not update with invalid payload', async () => {
			mockPrisma.user.findUnique.mockResolvedValue({ ...user1, id: 1, deletedAt: null });
			const res = await request(app).put('/api/users/1').send(invalidUserPayload);
			expect(res.statusCode).toBe(400);
		});
		it('should return 404 for non-existent user', async () => {
			mockPrisma.user.findUnique.mockResolvedValue(null);
			mockPrisma.user.update.mockResolvedValue(null);
			const res = await request(app).put('/api/users/999').send(updateUserPayload);
			expect(res.statusCode).toBe(404);
		});
		it('should return 409 if email already in use', async () => {
			mockPrisma.user.findUnique.mockResolvedValue({ ...user2, id: 2, deletedAt: null });
			mockPrisma.user.update.mockResolvedValue({ ...user1, id: 1, deletedAt: null });
			const res = await request(app).put('/api/users/1').send({ email: user2.email });
			expect(res.statusCode).toBe(409);
		});
	});

	describe('deleteUser', () => {
		it('should delete user', async () => {
			mockPrisma.user.update.mockResolvedValue({ ...user1, deletedAt: new Date() });
			const res = await request(app).delete('/api/users/1');
			expect(res.statusCode).toBe(204);
		});
		it('should return 404 for non-existent user', async () => {
			mockPrisma.user.update.mockResolvedValue(null);
			const res = await request(app).delete('/api/users/999');
			expect(res.statusCode).toBe(404);
		});
	});

	describe('listUsers', () => {
		it('should list users', async () => {
			mockPrisma.user.findMany.mockResolvedValue([
				{ ...user1, deletedAt: null },
				{ ...user2, deletedAt: null }
			]);
			const res = await request(app).get('/api/users?limit=2');
			expect(res.statusCode).toBe(200);
			expect(res.body.data.length).toBe(2);
		});
	});
});

