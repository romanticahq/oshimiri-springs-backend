import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const sellers = {
  fidel: {
    sellerName: "Fidel Castro Used & Tokunbo Springs",
    sellerWhatsapp: "+2349017368066",
  },
  oshimiri: {
    sellerName: "Oshimiri Automotive Marketplace",
    sellerWhatsapp: "+447380739189",
  },
};

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

  const electricalParts = await prisma.category.upsert({
    where: { slug: "electronics" },
    update: {
      name: "Electrical Parts",
      description: "Automotive alternators, starter motors, lights, sensors, wiring, fans, and control modules.",
    },
    create: {
      name: "Electrical Parts",
      slug: "electronics",
      description: "Automotive alternators, starter motors, lights, sensors, wiring, fans, and control modules.",
    },
  });

  const batteries = await prisma.category.upsert({
    where: { slug: "batteries" },
    update: {},
    create: {
      name: "Batteries",
      slug: "batteries",
      description: "Car, van, and commercial vehicle batteries.",
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
    update: {
      ...sellers.fidel,
      imageUrl: "/images/products/product-toyota-camry-front-coil-spring.jpg",
    },
    create: {
      name: "Front Coil Spring - Toyota Camry",
      slug: "front-coil-spring-toyota-camry",
      description: "Front coil spring suitable for Toyota Camry models.",
      price: 45000,
      currency: "NGN",
      condition: "New",
      location: "Lagos, Nigeria",
      imageUrl: "/images/products/product-toyota-camry-front-coil-spring.jpg",
      ...sellers.fidel,
      vehicleMakeModel: "Toyota Camry",
      yearRange: "Seller to confirm",
      position: "Front",
      inStock: true,
      categoryId: suspension.id,
    },
  });

  await prisma.product.upsert({
    where: { slug: "rear-shock-absorber-honda-accord" },
    update: sellers.fidel,
    create: {
      name: "Rear Shock Absorber - Honda Accord",
      slug: "rear-shock-absorber-honda-accord",
      description: "Rear shock absorber suitable for Honda Accord models.",
      price: 65000,
      currency: "NGN",
      condition: "New",
      location: "Abuja, Nigeria",
      imageUrl: "/images/products/rear-shock-absorber.jpg",
      ...sellers.fidel,
      vehicleMakeModel: "Honda Accord",
      yearRange: "Seller to confirm",
      position: "Rear",
      inStock: true,
      categoryId: suspension.id,
    },
  });

  await prisma.product.upsert({
    where: { slug: "led-headlight-unit-bmw-3-series" },
    update: sellers.oshimiri,
    create: {
      name: "LED Headlight Unit - BMW 3 Series",
      slug: "led-headlight-unit-bmw-3-series",
      description: "Used LED headlight unit for BMW 3 Series.",
      price: 180000,
      currency: "NGN",
      condition: "Used",
      location: "London, United Kingdom",
      imageUrl: "/images/products/bmw-headlight.jpg",
      ...sellers.oshimiri,
      vehicleMakeModel: "BMW 3 Series",
      yearRange: "Seller to confirm",
      inStock: true,
      categoryId: electricalParts.id,
    },
  });

  const starterProducts = [
    {
      name: "Mercedes Benz Farka 207 Rear Leaf Spring",
      slug: "mercedes-benz-farka-207-rear-leaf-spring",
      description:
        "Rear leaf spring suitable for Mercedes Benz Farka 207. Built for load support and stable suspension performance. Compatibility to be confirmed by seller before purchase.",
      price: null,
      currency: "NGN",
      condition: "Seller to confirm",
      location: "Nigeria",
      imageUrl: "/images/products/product-mercedes-207-rear-leaf-spring.jpg",
      ...sellers.fidel,
      vehicleMakeModel: "Mercedes Benz Farka 207",
      yearRange: "Seller to confirm",
      position: "Back",
      categoryId: suspension.id,
    },
    {
      name: "Mercedes Benz Farka 207 Front Leaf Spring",
      slug: "mercedes-benz-farka-207-front-leaf-spring",
      description:
        "Front leaf spring suitable for Mercedes Benz Farka 207. Seller should confirm packing, measurement, and exact fitment before payment.",
      price: null,
      currency: "NGN",
      condition: "Seller to confirm",
      location: "Nigeria",
      imageUrl: "/images/products/product-mercedes-207-front-leaf-spring.jpg",
      ...sellers.fidel,
      vehicleMakeModel: "Mercedes Benz Farka 207",
      yearRange: "Seller to confirm",
      position: "Front",
      categoryId: suspension.id,
    },
    {
      name: "Ford Ranger Leaf Spring",
      slug: "ford-ranger-leaf-spring",
      description:
        "Leaf spring for Ford Ranger pickup applications. Suitable fitment depends on model year, loading, and spring packing.",
      price: null,
      currency: "NGN",
      condition: "Seller to confirm",
      location: "Nigeria",
      imageUrl: "/images/products/product-ford-ranger-leaf-spring.jpg",
      ...sellers.fidel,
      vehicleMakeModel: "Ford Ranger",
      yearRange: "Seller to confirm",
      position: "Back",
      categoryId: suspension.id,
    },
    {
      name: "Mitsubishi Canter Rear Leaf Spring",
      slug: "mitsubishi-canter-rear-leaf-spring",
      description:
        "Rear leaf spring for Mitsubishi Canter truck and bus applications. Confirm model, packing, and measurement with seller.",
      price: null,
      currency: "NGN",
      condition: "Seller to confirm",
      location: "Nigeria",
      imageUrl: "/images/products/product-mitsubishi-canter-rear-leaf-spring.jpg",
      ...sellers.fidel,
      vehicleMakeModel: "Mitsubishi Canter",
      yearRange: "Seller to confirm",
      position: "Back",
      categoryId: suspension.id,
    },
    {
      name: "Nissan Cabstar New Model Leaf Spring",
      slug: "nissan-cabstar-new-model-leaf-spring",
      description:
        "Leaf spring for Nissan Cabstar new model applications. Confirm year range, chassis, and spring packing before purchase.",
      price: null,
      currency: "NGN",
      condition: "Seller to confirm",
      location: "Nigeria",
      imageUrl: "/images/products/product-nissan-cabstar-leaf-spring.jpg",
      ...sellers.fidel,
      vehicleMakeModel: "Nissan Cabstar",
      yearRange: "Seller to confirm",
      position: "Seller to confirm",
      categoryId: suspension.id,
    },
    {
      name: "Suspension Bushing Set",
      slug: "suspension-bushing-set",
      description:
        "Suspension bushing set for automotive leaf spring and suspension applications. Exact size and vehicle fitment must be confirmed by seller.",
      price: null,
      currency: "NGN",
      condition: "New",
      location: "Nigeria",
      imageUrl: "/images/products/product-suspension-bushing-set.jpg",
      ...sellers.fidel,
      vehicleMakeModel: "Universal - seller to confirm",
      yearRange: "Seller to confirm",
      position: "Bushing",
      categoryId: suspension.id,
    },
    {
      name: "75Ah Car Battery",
      slug: "75ah-car-battery",
      description:
        "75Ah car battery for many saloon cars and small SUVs. Brand, warranty, terminal position, and compatibility to be confirmed before purchase.",
      price: null,
      currency: "NGN",
      condition: "New",
      location: "Nigeria",
      imageUrl: "/images/products/placeholder-car-battery.jpg",
      ...sellers.oshimiri,
      vehicleMakeModel: "Universal - seller to confirm",
      yearRange: "Seller to confirm",
      brand: "Seller to confirm",
      batterySize: "75Ah",
      categoryId: batteries.id,
    },
    {
      name: "100Ah Van Battery",
      slug: "100ah-van-battery",
      description:
        "100Ah battery suitable for vans, buses, SUVs, and larger vehicles depending on fitment. Confirm brand, warranty, and terminal position.",
      price: null,
      currency: "NGN",
      condition: "New",
      location: "Nigeria",
      imageUrl: "/images/products/placeholder-car-battery.jpg",
      ...sellers.oshimiri,
      vehicleMakeModel: "Vans and commercial vehicles - seller to confirm",
      yearRange: "Seller to confirm",
      brand: "Seller to confirm",
      batterySize: "100Ah",
      categoryId: batteries.id,
    },
    {
      name: "Alternator",
      slug: "alternator",
      description:
        "Automotive alternator for cars, vans, buses, and pickups. Seller must confirm amperage, plug type, pulley type, and vehicle fitment before purchase.",
      price: null,
      currency: "NGN",
      condition: "Seller to confirm",
      location: "Nigeria",
      imageUrl: "/images/products/placeholder-alternator.jpg",
      ...sellers.oshimiri,
      vehicleMakeModel: "Cars, vans, buses, and pickups - seller to confirm",
      yearRange: "Seller to confirm",
      position: "Engine electrical",
      categoryId: electricalParts.id,
    },
    {
      name: "Starter Motor",
      slug: "starter-motor",
      description:
        "Starter motor for automotive applications. Confirm vehicle model, engine type, mounting points, and compatibility with seller before payment.",
      price: null,
      currency: "NGN",
      condition: "Seller to confirm",
      location: "Nigeria",
      imageUrl: "/images/products/placeholder-starter-motor.jpg",
      ...sellers.oshimiri,
      vehicleMakeModel: "Cars, vans, buses, and pickups - seller to confirm",
      yearRange: "Seller to confirm",
      position: "Engine electrical",
      categoryId: electricalParts.id,
    },
    {
      name: "Headlight Assembly",
      slug: "headlight-assembly",
      description:
        "Headlight assembly for cars, vans, buses, and pickups. Buyer should confirm left/right side, model year, and lamp type before purchase.",
      price: null,
      currency: "NGN",
      condition: "Seller to confirm",
      location: "Nigeria",
      imageUrl: "/images/products/placeholder-light-assembly.jpg",
      ...sellers.oshimiri,
      vehicleMakeModel: "Cars, vans, buses, and pickups - seller to confirm",
      yearRange: "Seller to confirm",
      position: "Front lighting",
      categoryId: electricalParts.id,
    },
    {
      name: "Tail Light Assembly",
      slug: "tail-light-assembly",
      description:
        "Tail light assembly for automotive rear lighting replacement. Confirm left/right side, model, and year with seller.",
      price: null,
      currency: "NGN",
      condition: "Seller to confirm",
      location: "Nigeria",
      imageUrl: "/images/products/placeholder-tail-light-assembly.jpg",
      ...sellers.oshimiri,
      vehicleMakeModel: "Cars, vans, buses, and pickups - seller to confirm",
      yearRange: "Seller to confirm",
      position: "Rear lighting",
      categoryId: electricalParts.id,
    },
    {
      name: "Automotive Sensors",
      slug: "automotive-sensors",
      description:
        "Vehicle sensors for engine and body systems. Exact sensor type, part number, and vehicle compatibility must be confirmed before purchase.",
      price: null,
      currency: "NGN",
      condition: "Seller to confirm",
      location: "Nigeria",
      imageUrl: "/images/products/placeholder-sensors-fuse-box.jpg",
      ...sellers.oshimiri,
      vehicleMakeModel: "Cars, vans, buses, and pickups - seller to confirm",
      yearRange: "Seller to confirm",
      position: "Sensor",
      categoryId: electricalParts.id,
    },
    {
      name: "Fuse Box",
      slug: "fuse-box",
      description:
        "Automotive fuse box replacement. Confirm part number, vehicle model, connector layout, and fuse arrangement with seller.",
      price: null,
      currency: "NGN",
      condition: "Seller to confirm",
      location: "Nigeria",
      imageUrl: "/images/products/placeholder-fuse-box.jpg",
      ...sellers.oshimiri,
      vehicleMakeModel: "Cars, vans, buses, and pickups - seller to confirm",
      yearRange: "Seller to confirm",
      position: "Electrical box",
      categoryId: electricalParts.id,
    },
    {
      name: "Wiring Harness",
      slug: "wiring-harness",
      description:
        "Automotive wiring harness for vehicle electrical connections. Seller must confirm connector type, vehicle model, and application.",
      price: null,
      currency: "NGN",
      condition: "Seller to confirm",
      location: "Nigeria",
      imageUrl: "/images/products/placeholder-wiring-harness.jpg",
      ...sellers.oshimiri,
      vehicleMakeModel: "Cars, vans, buses, and pickups - seller to confirm",
      yearRange: "Seller to confirm",
      position: "Wiring",
      categoryId: electricalParts.id,
    },
    {
      name: "Cooling Fan",
      slug: "cooling-fan",
      description:
        "Automotive cooling fan for radiator and engine cooling systems. Confirm fan size, connector, shroud type, and vehicle fitment with seller.",
      price: null,
      currency: "NGN",
      condition: "Seller to confirm",
      location: "Nigeria",
      imageUrl: "/images/products/placeholder-cooling-fan.jpg",
      ...sellers.oshimiri,
      vehicleMakeModel: "Cars, vans, buses, and pickups - seller to confirm",
      yearRange: "Seller to confirm",
      position: "Cooling system",
      categoryId: electricalParts.id,
    },
    {
      name: "AC Compressor Electrical Controls",
      slug: "ac-compressor-electrical-controls",
      description:
        "Electrical controls and related components for automotive AC compressor systems. Seller should confirm AC system type and exact vehicle application.",
      price: null,
      currency: "NGN",
      condition: "Seller to confirm",
      location: "Nigeria",
      imageUrl: "/images/products/placeholder-ac-controls.jpg",
      ...sellers.oshimiri,
      vehicleMakeModel: "Cars, vans, buses, and pickups - seller to confirm",
      yearRange: "Seller to confirm",
      position: "AC electrical control",
      categoryId: electricalParts.id,
    },
    {
      name: "ECU / Control Module",
      slug: "ecu-control-module",
      description:
        "ECU and control module listings for automotive systems. Buyer must confirm part number, programming needs, and compatibility before purchase.",
      price: null,
      currency: "NGN",
      condition: "Seller to confirm",
      location: "Nigeria",
      imageUrl: "/images/products/placeholder-ecu-module.jpg",
      ...sellers.oshimiri,
      vehicleMakeModel: "Cars, vans, buses, and pickups - seller to confirm",
      yearRange: "Seller to confirm",
      position: "Control module",
      categoryId: electricalParts.id,
    },
  ];

  for (const product of starterProducts) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    });
  }

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
