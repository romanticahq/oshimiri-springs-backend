-- Add V2 marketplace foundation fields.
ALTER TABLE "Product" ADD COLUMN "imageUrls" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Product" ADD COLUMN "sellerId" TEXT;

CREATE TABLE "Seller" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "phone" TEXT,
    "location" TEXT,
    "specialty" TEXT,
    "description" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "rating" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Seller_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Engineer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "phone" TEXT,
    "location" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "experience" TEXT,
    "description" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "rating" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Engineer_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Seller_slug_key" ON "Seller"("slug");
CREATE UNIQUE INDEX "Engineer_slug_key" ON "Engineer"("slug");

ALTER TABLE "Product" ADD CONSTRAINT "Product_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller"("id") ON DELETE SET NULL ON UPDATE CASCADE;
