// Tests for session controller endpoints
// We mock prisma before importing the app so controller uses the mocked client.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import sessionFixtures from './fixtures/session_fixtures.js';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';

// Build mock prisma with session namespace methods used by controller.
// Use vi.hoisted so the object exists before mock factory is hoisted.
const hoisted = vi.hoisted(() => ({
  mockPrisma: {
    session: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn()
    }
  }
}));
const { mockPrisma } = hoisted;

vi.mock('../config/prisma.js', () => ({
  default: hoisted.mockPrisma
}));

import app from '../main.js';

const {
  validSession,
  expiredSession,
  invalidContentSession,
  newSessionPayload,
  updateSessionPayload,
  missingFieldsPayload
} = sessionFixtures;

describe('Session Controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.session.findMany.mockReset();
    mockPrisma.session.findUnique.mockReset();
    mockPrisma.session.upsert.mockReset();
    mockPrisma.session.delete.mockReset();
  });

  // listSessions
  describe('GET /api/sessions', () => {
    it('lists all sessions', async () => {
      mockPrisma.session.findMany.mockResolvedValue([validSession, expiredSession]);
      const res = await request(app).get('/api/sessions');
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(2);
      expect(mockPrisma.session.findMany).toHaveBeenCalledTimes(1);
    });
  });

  // getSession
  describe('GET /api/sessions/:id', () => {
    it('returns session when found', async () => {
      mockPrisma.session.findUnique.mockResolvedValue(validSession);
      const res = await request(app).get(`/api/sessions/${validSession.id}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.id).toBe(validSession.id);
    });
    it('404 when session missing', async () => {
      mockPrisma.session.findUnique.mockResolvedValue(null);
      const res = await request(app).get('/api/sessions/unknown');
      expect(res.statusCode).toBe(404);
      expect(res.body.code).toBe('ERROR');
    });
  });

  // upsertSession (create)
  describe('POST /api/sessions create new', () => {
    it('creates new session when not existing', async () => {
      mockPrisma.session.upsert.mockResolvedValue(newSessionPayload);
      const res = await request(app).post('/api/sessions').send(newSessionPayload);
      expect(res.statusCode).toBe(201);
      expect(res.body.id).toBe(newSessionPayload.id);
      expect(mockPrisma.session.upsert).toHaveBeenCalledWith({
        where: { id: newSessionPayload.id },
        update: { content: newSessionPayload.content, shop: newSessionPayload.shop },
        create: { id: newSessionPayload.id, content: newSessionPayload.content, shop: newSessionPayload.shop }
      });
    });
    it('400 when missing required fields', async () => {
      const res = await request(app).post('/api/sessions').send(missingFieldsPayload);
      expect(res.statusCode).toBe(400);
      // ApiError with 400 falls back to generic code in error handler
      expect(res.body.code).toBeDefined();
    });
  });

  // upsertSession (update existing)
  describe('POST /api/sessions update existing', () => {
    it('updates existing session', async () => {
      mockPrisma.session.upsert.mockResolvedValue(updateSessionPayload);
      const res = await request(app).post('/api/sessions').send(updateSessionPayload);
      expect(res.statusCode).toBe(201);
      expect(res.body.content).toBe(updateSessionPayload.content);
    });
  });

  // deleteSession
  describe('DELETE /api/sessions/:id', () => {
    it('deletes existing session', async () => {
      mockPrisma.session.delete.mockResolvedValue({});
      const res = await request(app).delete(`/api/sessions/${validSession.id}`);
      expect(res.statusCode).toBe(204);
    });
    it('returns 404 when deleting missing session', async () => {
      const prismaError = { code: 'P2025', message: 'Record not found' };
      mockPrisma.session.delete.mockRejectedValue(prismaError);
      const res = await request(app).delete('/api/sessions/missing');
      expect(res.statusCode).toBe(404);
    });
  });

  // validateSession
  describe('GET /api/sessions/:id/validate', () => {
    it('validates a non-expired session', async () => {
      mockPrisma.session.findUnique.mockResolvedValue(validSession);
      const res = await request(app).get(`/api/sessions/${validSession.id}/validate`);
      expect(res.statusCode).toBe(200);
      expect(res.body.valid).toBe(true);
    });
    it('rejects expired session', async () => {
      mockPrisma.session.findUnique.mockResolvedValue(expiredSession);
      const res = await request(app).get(`/api/sessions/${expiredSession.id}/validate`);
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toMatch(/expired/i);
    });
    it('rejects invalid JSON content', async () => {
      mockPrisma.session.findUnique.mockResolvedValue(invalidContentSession);
      const res = await request(app).get(`/api/sessions/${invalidContentSession.id}/validate`);
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toMatch(/invalid content/i);
    });
    it('404 when validating missing session', async () => {
      mockPrisma.session.findUnique.mockResolvedValue(null);
      const res = await request(app).get('/api/sessions/unknown/validate');
      expect(res.statusCode).toBe(404);
    });
  });
});
