// Load environment variables for Prisma CLI because automatic .env loading is skipped when using prisma.config.ts
// See: https://pris.ly/prisma-config-env-vars
import 'dotenv/config';

export default {
  schema: './prisma/schema.prisma',
};
