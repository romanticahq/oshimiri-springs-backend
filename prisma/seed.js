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
    sellerName: "Oshimiri Sourcing Desk",
    sellerWhatsapp: "+447380739189",
  },
};

const sellerProfiles = {
  fidel: {
    name: "Fidel Castro Used & Tokunbo Springs",
    slug: "fidel-castro-used-tokunbo-springs",
    whatsapp: "+2349017368066",
    phone: "+2349017368066",
    location: "Nigeria",
    coverageArea: "Nationwide / seller to confirm",
    specialty: "Leaf springs, coil springs, bushings, and suspension parts",
    description:
      "Verified Oshimiri seller for used and tokunbo suspension parts. Buyers should confirm exact fitment, condition, and availability before payment.",
    verified: true,
    rating: "4.7",
  },
  oshimiri: {
    name: "Oshimiri Sourcing Desk",
    slug: "oshimiri-sourcing-desk",
    whatsapp: "+447380739189",
    phone: "+447380739189",
    location: "Nigeria",
    coverageArea: "Nationwide sourcing support",
    specialty: "Parts sourcing, batteries, engines, exterior parts, and electrical parts",
    description:
      "Oshimiri support desk for parts sourcing, seller coordination, and buyer enquiries across Nigeria.",
    verified: true,
    rating: "4.8",
  },
  ekSprings: {
    name: "E&K Springs Enterprises",
    slug: "ek-springs-enterprises",
    whatsapp: "+2349017368066",
    phone: "+2349017368066",
    location: "Nigeria",
    coverageArea: "Nationwide / seller to confirm",
    specialty: "Suspension springs and commercial vehicle spring support",
    description:
      "Featured suspension seller for springs and suspension support. Availability and prices should be confirmed directly.",
    verified: true,
    rating: "4.8",
  },
};

const starterPriceBySlug = {
  "complete-engine-assembly": 750000,
  "engine-parts-accessories": 35000,
  "front-bumper-assembly": 180000,
  "side-mirror-assembly": 65000,
  "fender-panel-body-trim": 120000,
  "mercedes-benz-farka-207-rear-leaf-spring": 95000,
  "mercedes-benz-farka-207-front-leaf-spring": 85000,
  "ford-ranger-leaf-spring": 120000,
  "mitsubishi-canter-rear-leaf-spring": 145000,
  "nissan-cabstar-new-model-leaf-spring": 135000,
  "suspension-bushing-set": 25000,
  "75ah-car-battery": 145000,
  "100ah-van-battery": 210000,
  alternator: 85000,
  "starter-motor": 90000,
  "cooling-fan": 60000,
  "ecu-control-module": 160000,
};

async function main() {
  const sellerRecords = {};

  for (const [key, seller] of Object.entries(sellerProfiles)) {
    sellerRecords[key] = await prisma.seller.upsert({
      where: { slug: seller.slug },
      update: seller,
      create: seller,
    });
  }

  await prisma.engineer.upsert({
    where: { slug: "oshimiri-mobile-engineer-support" },
    update: {
      name: "Oshimiri Mobile Engineer Support",
      whatsapp: "+2349017368066",
      phone: "+2349017368066",
      location: "Nigeria",
      coverageArea: "Nationwide / seller to confirm",
      specialty: "Inspection, fitting, suspension, engine, and general vehicle repair",
      experience: "Seller to confirm",
      description:
        "Repair support desk for customers who need an available automotive engineer for inspection, fitting, or vehicle repair. Customer should confirm scope, cost, location, and warranty before work begins.",
      verified: true,
      rating: "4.8",
      imageUrl: "/images/engineers/engineer-repair.jpg",
    },
    create: {
      name: "Oshimiri Mobile Engineer Support",
      slug: "oshimiri-mobile-engineer-support",
      whatsapp: "+2349017368066",
      phone: "+2349017368066",
      location: "Nigeria",
      coverageArea: "Nationwide / seller to confirm",
      specialty: "Inspection, fitting, suspension, engine, and general vehicle repair",
      experience: "Seller to confirm",
      description:
        "Repair support desk for customers who need an available automotive engineer for inspection, fitting, or vehicle repair. Customer should confirm scope, cost, location, and warranty before work begins.",
      verified: true,
      rating: "4.8",
      imageUrl: "/images/engineers/engineer-repair.jpg",
    },
  });

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

  const engines = await prisma.category.upsert({
    where: { slug: "engines" },
    update: {},
    create: {
      name: "Engines",
      slug: "engines",
      description: "Complete engines and engine parts.",
    },
  });

  const bodyParts = await prisma.category.upsert({
    where: { slug: "body-parts" },
    update: {
      name: "Exterior Parts",
      description: "Exterior panels, bumpers, mirrors, and trims.",
    },
    create: {
      name: "Exterior Parts",
      slug: "body-parts",
      description: "Exterior panels, bumpers, mirrors, and trims.",
    },
  });

  await prisma.product.deleteMany({
    where: {
      slug: {
        in: [
          "ac-compressor-electrical-controls",
          "automotive-sensors",
          "fuse-box",
          "headlight-assembly",
          "tail-light-assembly",
          "wiring-harness",
        ],
      },
    },
  });

  await prisma.product.upsert({
    where: { slug: "front-coil-spring-toyota-camry" },
    update: {
      ...sellers.fidel,
      imageUrl: "/images/products/product-toyota-camry-front-coil-spring.jpg",
      imageUrls: ["/images/products/product-toyota-camry-front-coil-spring.jpg"],
      sellerId: sellerRecords.fidel.id,
    },
    create: {
      name: "Front Coil Spring - Toyota Camry",
      slug: "front-coil-spring-toyota-camry",
      description: "Front coil spring suitable for Toyota Camry models.",
      price: 45000,
      currency: "NGN",
      condition: "New",
      location: "Lagos, Nigeria",
      coverageArea: "South West / Lagos Axis",
      imageUrl: "/images/products/product-toyota-camry-front-coil-spring.jpg",
      imageUrls: ["/images/products/product-toyota-camry-front-coil-spring.jpg"],
      ...sellers.fidel,
      sellerId: sellerRecords.fidel.id,
      vehicleMakeModel: "Toyota Camry",
      yearRange: "Seller to confirm",
      position: "Front",
      inStock: true,
      categoryId: suspension.id,
    },
  });

  await prisma.product.upsert({
    where: { slug: "rear-shock-absorber-honda-accord" },
    update: {
      imageUrl: "/images/products/product-honda-accord-rear-shock.jpg",
      imageUrls: ["/images/products/product-honda-accord-rear-shock.jpg"],
      ...sellers.fidel,
      sellerId: sellerRecords.fidel.id,
    },
    create: {
      name: "Rear Shock Absorber - Honda Accord",
      slug: "rear-shock-absorber-honda-accord",
      description: "Rear shock absorber suitable for Honda Accord models.",
      price: 65000,
      currency: "NGN",
      condition: "New",
      location: "Abuja, Nigeria",
      coverageArea: "North Central / Abuja Axis",
      imageUrl: "/images/products/product-honda-accord-rear-shock.jpg",
      imageUrls: ["/images/products/product-honda-accord-rear-shock.jpg"],
      ...sellers.fidel,
      sellerId: sellerRecords.fidel.id,
      vehicleMakeModel: "Honda Accord",
      yearRange: "Seller to confirm",
      position: "Rear",
      inStock: true,
      categoryId: suspension.id,
    },
  });

  await prisma.product.upsert({
    where: { slug: "led-headlight-unit-bmw-3-series" },
    update: {
      imageUrl: "/images/products/product-bmw-3-series-led-headlight.jpg",
      imageUrls: ["/images/products/product-bmw-3-series-led-headlight.jpg"],
      ...sellers.oshimiri,
      sellerId: sellerRecords.oshimiri.id,
    },
    create: {
      name: "LED Headlight Unit - BMW 3 Series",
      slug: "led-headlight-unit-bmw-3-series",
      description: "Used LED headlight unit for BMW 3 Series.",
      price: 180000,
      currency: "NGN",
      condition: "Used",
      location: "Nigeria",
      coverageArea: "Nationwide / seller to confirm",
      imageUrl: "/images/products/product-bmw-3-series-led-headlight.jpg",
      imageUrls: ["/images/products/product-bmw-3-series-led-headlight.jpg"],
      ...sellers.oshimiri,
      sellerId: sellerRecords.oshimiri.id,
      vehicleMakeModel: "BMW 3 Series",
      yearRange: "Seller to confirm",
      inStock: true,
      categoryId: electricalParts.id,
    },
  });

  const starterProducts = [
    {
      name: "Complete Engine Assembly",
      slug: "complete-engine-assembly",
      description:
        "Complete tokunbo engine assembly for cars, vans, buses, and commercial vehicles. Confirm engine code, fuel type, mileage, gearbox compatibility, and warranty terms with seller.",
      price: null,
      currency: "NGN",
      condition: "Tokunbo",
      location: "Nigeria",
      imageUrl: "/images/products/product-complete-engine-assembly.jpg",
      ...sellers.oshimiri,
      vehicleMakeModel: "Cars, vans, buses, and commercial vehicles - seller to confirm",
      yearRange: "Seller to confirm",
      position: "Engine bay",
      categoryId: engines.id,
    },
    {
      name: "Engine Service Parts Kit",
      slug: "engine-parts-accessories",
      description:
        "Engine service parts such as belts, filters, hoses, pulleys, plugs, and gasket items. Confirm part number, engine type, and vehicle fitment before payment.",
      price: null,
      currency: "NGN",
      condition: "New / Tokunbo",
      location: "Nigeria",
      imageUrl: "/images/products/product-engine-parts-accessories.jpg",
      ...sellers.oshimiri,
      vehicleMakeModel: "Cars, vans, buses, and commercial vehicles - seller to confirm",
      yearRange: "Seller to confirm",
      position: "Engine",
      categoryId: engines.id,
    },
    {
      name: "Front Bumper Assembly",
      slug: "front-bumper-assembly",
      description:
        "Front bumper assembly for cars, vans, buses, and pickups. Confirm exact model year, colour, grille opening, sensor holes, fog-lamp spaces, and mounting points.",
      price: null,
      currency: "NGN",
      condition: "New / Tokunbo",
      location: "Nigeria",
      imageUrl: "/images/products/product-front-bumper-assembly.jpg",
      ...sellers.oshimiri,
      vehicleMakeModel: "Cars, vans, buses, and pickups - seller to confirm",
      yearRange: "Seller to confirm",
      position: "Front exterior",
      categoryId: bodyParts.id,
    },
    {
      name: "Side Mirror Assembly",
      slug: "side-mirror-assembly",
      description:
        "Side mirror assembly for automotive replacement. Confirm left/right side, power folding, indicator light, camera support, colour, and vehicle year before payment.",
      price: null,
      currency: "NGN",
      condition: "New / Tokunbo",
      location: "Nigeria",
      imageUrl: "/images/products/product-side-mirror-assembly.jpg",
      ...sellers.oshimiri,
      vehicleMakeModel: "Cars, vans, buses, and pickups - seller to confirm",
      yearRange: "Seller to confirm",
      position: "Side exterior",
      categoryId: bodyParts.id,
    },
    {
      name: "Fender Panel and Exterior Trim",
      slug: "fender-panel-body-trim",
      description:
        "Exterior fender panel and trim pieces for vehicle repair. Confirm left/right side, vehicle model, year, colour, panel edges, clips, and mounting points with seller.",
      price: null,
      currency: "NGN",
      condition: "New / Tokunbo",
      location: "Nigeria",
      imageUrl: "/images/products/product-fender-panel-body-trim.jpg",
      ...sellers.oshimiri,
      vehicleMakeModel: "Cars, vans, buses, and pickups - seller to confirm",
      yearRange: "Seller to confirm",
      position: "Exterior trim",
      categoryId: bodyParts.id,
    },
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
      imageUrl: "/images/products/product-75ah-car-battery.jpg",
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
      imageUrl: "/images/products/product-100ah-van-battery.jpg",
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
        "Replacement automotive alternator for cars, vans, buses, and pickups. Powers vehicle electrical systems and keeps the battery charged while the engine is running. Buyer should confirm amperage, plug type, pulley type, vehicle model, year, and mounting points with seller before payment.",
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
    const productWithPrice = {
      ...product,
      price: product.price ?? starterPriceBySlug[product.slug] ?? null,
      priceLabel: product.price ?? starterPriceBySlug[product.slug] ? null : "Negotiable",
      imageUrls: product.imageUrls ?? (product.imageUrl ? [product.imageUrl] : []),
      sellerId:
        product.sellerName === sellers.fidel.sellerName
          ? sellerRecords.fidel.id
          : sellerRecords.oshimiri.id,
    };

    await prisma.product.upsert({
      where: { slug: productWithPrice.slug },
      update: productWithPrice,
      create: productWithPrice,
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
