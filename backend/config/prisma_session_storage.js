
import { PrismaClient } from '@prisma/client';
import { encrypt, decrypt } from '../utils/crypto.js';

const prisma = new PrismaClient();

function isExpired(session) {
    // Shopify session objects have 'expires' or 'expiresAt' (ISO string)
    const exp = session.expires || session.expiresAt;
    if (!exp) return false;
    return new Date(exp) < new Date();
}

export class PrismaSessionStorage {
  async storeSession(session) {
    const encrypted = encrypt(JSON.stringify(session));
    await prisma.session.upsert({
      where: { id: session.id },
      update: {
        content: encrypted,
        shop: session.shop,
      },
      create: {
        id: session.id,
        content: encrypted,
        shop: session.shop,
      },
    });
    return true;
  }

  async loadSession(id) {
    const sessionRecord = await prisma.session.findUnique({ where: { id } });
    if (!sessionRecord) {
      return undefined;
    }
    let session;
    try {
      session = JSON.parse(decrypt(sessionRecord.content));
    } catch (e) {
      return undefined;
    }
    if (isExpired(session)) {
      // Optionally delete expired session
      await this.deleteSession(id);
      return undefined;
    }
    return session;
  }

  async deleteSession(id) {
    await prisma.session.delete({ where: { id } });
    return true;
  }

  async deleteSessions(ids) {
    await prisma.session.deleteMany({ where: { id: { in: ids } } });
    return true;
  }

  async findSessionsByShop(shop) {
    const sessions = await prisma.session.findMany({ where: { shop } });
    return sessions.map(session => {
      try {
        const s = JSON.parse(decrypt(session.content));
        return isExpired(s) ? undefined : s;
      } catch {
        return undefined;
      }
    }).filter(Boolean);
  }
}
