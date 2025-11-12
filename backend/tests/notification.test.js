import { describe, it, beforeAll, afterEach, expect, vi } from "vitest";
import jsonwebtoken from "jsonwebtoken";
import request from "supertest";
// Ensure a JWT secret is available for signing tokens in tests
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret';
let app;
const prisma = {
  user: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  notification: {
    findMany: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
    create: vi.fn(),
  },
};
import { user, userWithPrefs, notification } from "./fixtures/notification_fixtures.js";


vi.mock('@sendgrid/mail', () => ({
  default: {
    setApiKey: vi.fn(),
    send: vi.fn(),
  }
}));

// Mock the prisma module so any import/dynamic import returns our mocked client
vi.mock('../config/prisma.js', () => ({ default: prisma }));


describe("Notification Routes", () => {
  let token;

  beforeAll(async () => {
      prisma.user.findUnique = vi.fn().mockResolvedValue(user);
      prisma.user.update = vi.fn();
      prisma.notification.findMany = vi.fn();
      prisma.notification.update = vi.fn();
      prisma.notification.updateMany = vi.fn();
      prisma.notification.delete = vi.fn();
      prisma.notification.deleteMany = vi.fn();
      prisma.notification.create = vi.fn();
      prisma.shop = {
        findUnique: vi.fn().mockResolvedValue({ shop: "test-shop.myshopify.com", accessToken: "test-access-token" })
      };
      token = "Bearer " + jsonwebtoken.sign({ id: user.id, shop: "test-shop.myshopify.com" }, process.env.JWT_SECRET, { expiresIn: "1h" });
      const main = await import("../main.js");
      app = main.default;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/notifications", () => {
    it("should get all notifications for a user", async () => {
      prisma.notification.findMany.mockResolvedValue([notification]);

      const res = await request(app)
        .get("/api/notifications")
        .set("Authorization", token);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].message).toBe(notification.message);
    });
  });

  describe("PUT /api/notifications/preferences", () => {
    it("should update user notification preferences", async () => {
      const preferences = { "new_feature": { "email": false, "inApp": true } };
      prisma.user.update.mockResolvedValue({ ...user, notificationPreferences: preferences });

      const res = await request(app)
        .put("/api/notifications/preferences")
        .set("Authorization", token)
        .send({ preferences });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toBe("Notification preferences updated");
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: user.id },
        data: { notificationPreferences: preferences },
      });
    });
  });

    describe("PUT /api/notifications/read-all", () => {
        it("should mark all notifications as read", async () => {
            prisma.notification.updateMany.mockResolvedValue({ count: 1 });

            const res = await request(app)
                .put("/api/notifications/read-all")
                .set("Authorization", token);

            expect(res.statusCode).toEqual(200);
            expect(res.body.data).toBe("All notifications marked as read");
        });
    });

    describe("PUT /api/notifications/:id/read", () => {
        it("should mark a single notification as read", async () => {
            prisma.notification.update.mockResolvedValue({ ...notification, isRead: true });

            const res = await request(app)
                .put(`/api/notifications/${notification.id}/read`)
                .set("Authorization", token);

            expect(res.statusCode).toEqual(200);
            expect(res.body.data.isRead).toBe(true);
        });
    });

    describe("DELETE /api/notifications/:id", () => {
        it("should delete a single notification", async () => {
            prisma.notification.delete.mockResolvedValue(notification);

            const res = await request(app)
                .delete(`/api/notifications/${notification.id}`)
                .set("Authorization", token);

            expect(res.statusCode).toEqual(200);
            expect(res.body.data).toBe("Notification deleted");
        });
    });

    describe("DELETE /api/notifications", () => {
        it("should delete all notifications for a user", async () => {
            prisma.notification.deleteMany.mockResolvedValue({ count: 1 });

            const res = await request(app)
                .delete("/api/notifications")
                .set("Authorization", token);

            expect(res.statusCode).toEqual(200);
            expect(res.body.data).toBe("All notifications deleted");
        });
    });
});
