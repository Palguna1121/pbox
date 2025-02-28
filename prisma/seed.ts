import { PrismaClient } from "@prisma/client";
import { hash } from "../src/lib/bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Seed admin user
  const adminEmail = "admin@gmail.com";
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        name: "Administreiter",
        email: adminEmail,
        password: await hash("password"),
        role: "admin",
        emailVerified: new Date(),
      },
    });
    console.log("Admin user created");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
