ALTER TABLE "Product" ALTER COLUMN "price" DROP NOT NULL;
ALTER TABLE "Product" ADD COLUMN "vehicleMakeModel" TEXT;
ALTER TABLE "Product" ADD COLUMN "yearRange" TEXT;
ALTER TABLE "Product" ADD COLUMN "position" TEXT;
ALTER TABLE "Product" ADD COLUMN "brand" TEXT;
ALTER TABLE "Product" ADD COLUMN "batterySize" TEXT;
