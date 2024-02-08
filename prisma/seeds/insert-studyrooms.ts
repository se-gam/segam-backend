import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

const rooms = require('./rooms.json');

async function main() {
  console.log(`Inserting ${rooms.length} studyrooms`);
  await prisma.studyroom.createMany({
    data: rooms,
    skipDuplicates: true,
  });
  console.log('Seeding studyrooms complete');
}

main();
