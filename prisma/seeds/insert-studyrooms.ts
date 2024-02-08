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
  await prisma.studyroom.createMany({
    data: rooms,
  });
}

main();
