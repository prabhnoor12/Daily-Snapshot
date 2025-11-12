import { PrismaClient } from '@prisma/client';
import { settingsToSeed } from './seed-data.js';

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Starting database seeding...');

    for (const setting of settingsToSeed) {
        const { key, value } = setting;
        try {
            const result = await prisma.setting.upsert({
                where: { key },
                update: {}, // No update needed if it exists, change if you want to overwrite
                create: {
                    key,
                    value: JSON.stringify(value),
                },
            });
            console.log(`✅ Setting '${key}' processed.`);
        } catch (error) {
            console.error(`❌ Error seeding setting '${key}':`, error);
        }
    }

    console.log('🎉 Seeding finished.');
}

main()
    .catch((e) => {
        console.error('🔥 An error occurred during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        console.log('🔌 Database connection closed.');
    });
