import { PrismaClient } from '@prisma/client';
import * as _ from 'lodash';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

const res = require('./restaurant.json');
const restaurants = _.map(res, (res) => ({
  name: res.name,
}));

console.log(restaurants);

async function main() {
  console.log(`Inserting ${restaurants.length} restaurants`);
  await prisma.restaurant.createMany({
    data: restaurants,
    skipDuplicates: true,
  });
  console.log('Seeding restaurants complete');
}

main();
