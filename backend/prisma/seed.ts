import { prisma } from "@/lib/prisma-client.js";
import { cfg } from "@/lib/env.js";

async function seedDatabase() {
  try {
    console.log("seeding...");

    const records = await prisma.user.count();
    if (records !== 0) {
      throw new Error("Data already exists, Seeding cancelled.");
    }

    await prisma.user.create({
      data: { username: cfg.GUEST_USERNAME },
    });

    console.log("Database seeding has been completed successfully.");
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();
