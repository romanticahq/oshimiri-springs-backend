import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {

  const suspension = await prisma.category.upsert({
    where: { slug: "suspension" },
    update: {},
    create: {
      name: "Suspension",
      slug: "suspension",
      description: "Springs, shocks, struts, and suspension kits.",
    },
  });

  const electronics = await prisma.category.upsert({
    where: { slug: "electronics" },
    update: {},
    create: {
      name: "Electronics",
      slug: "electronics",
      description: "Sensors, modules, lighting, and electrical parts.",
    },
  });

  await prisma.category.upsert({
    where: { slug: "engines" },
    update: {},
    create: {
      name: "Engines",
      slug: "engines",
      description: "Complete engines and engine parts.",
    },
  });

  await prisma.category.upsert({
    where: { slug: "body-parts" },
    update: {},
    create: {
      name: "Body Parts",
      slug: "body-parts",
      description: "Exterior panels, bumpers, mirrors, and trims.",
    },
  });

  await prisma.product.upsert({
    where: { slug: "front-coil-spring-toyota-camry" },
    update: {},
    create: {
      name: "Front Coil Spring - Toyota Camry",
      slug: "front-coil-spring-toyota-camry",
      description: "Front coil spring suitable for Toyota Camry models.",
      price: 45000,
      currency: "NGN",
      condition: "New",
      location: "Lagos, Nigeria",
      imageUrl: "/images/products/front-coil-spring.jpg",
      inStock: true,
      categoryId: suspension.id,
    },
  });

  await prisma.product.upsert({
    where: { slug: "rear-shock-absorber-honda-accord" },
    update: {},
    create: {
      name: "Rear Shock Absorber - Honda Accord",
      slug: "rear-shock-absorber-honda-accord",
      description: "Rear shock absorber suitable for Honda Accord models.",
      price: 65000,
      currency: "NGN",
      condition: "New",
      location: "Abuja, Nigeria",
      imageUrl: "/images/products/rear-shock-absorber.jpg",
      inStock: true,
      categoryId: suspension.id,
    },
  });

  await prisma.product.upsert({
    where: { slug: "led-headlight-unit-bmw-3-series" },
    update: {},
    create: {
      name: "LED Headlight Unit - BMW 3 Series",
      slug: "led-headlight-unit-bmw-3-series",
      description: "Used LED headlight unit for BMW 3 Series.",
      price: 180000,
      currency: "NGN",
      condition: "Used",
      location: "London, United Kingdom",
      imageUrl: "/images/products/bmw-headlight.jpg",
      inStock: true,
      categoryId: electronics.id,
    },
  });

  console.log("Database seeded successfully.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
