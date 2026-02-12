const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const media = await prisma.media.findMany({ take: 5 });
    console.log('Media URLs:', media.map(m => m.url));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
