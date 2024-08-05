import { PrismaClient } from '@prisma/client';
import xlsx from 'node-xlsx';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

const rawData = xlsx.parse('./prisma/seeds/lectures_20240206.xlsx');
const data = rawData[0].data;

const courses = data.slice(1).map((course) => {
  return {
    courseId: `${course[3]}-${course[4]}:${course[2]}`,
    name: course[5],
  };
}) as { courseId: string; name: string }[];

async function main() {
  console.log(`Inserting ${courses.length} courses`);
  await prisma.course.deleteMany();
  await prisma.course.createMany({
    data: courses,
  });
  console.log('Seeding courses complete');
}

main();
