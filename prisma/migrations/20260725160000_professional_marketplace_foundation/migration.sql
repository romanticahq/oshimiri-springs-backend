ALTER TABLE "Product" ADD COLUMN "publicReference" TEXT;
ALTER TABLE "Product" ADD COLUMN "vehicleMake" TEXT;
ALTER TABLE "Product" ADD COLUMN "vehicleModel" TEXT;
ALTER TABLE "Product" ADD COLUMN "yearFrom" INTEGER;
ALTER TABLE "Product" ADD COLUMN "yearTo" INTEGER;
ALTER TABLE "Product" ADD COLUMN "engineCode" TEXT;
ALTER TABLE "Product" ADD COLUMN "oemPartNumber" TEXT;
ALTER TABLE "Product" ADD COLUMN "partNumber" TEXT;
ALTER TABLE "Product" ADD COLUMN "side" TEXT;
ALTER TABLE "Product" ADD COLUMN "bodyType" TEXT;
ALTER TABLE "Product" ADD COLUMN "warranty" TEXT;
ALTER TABLE "Product" ADD COLUMN "availabilityStatus" TEXT NOT NULL DEFAULT 'available';
ALTER TABLE "Product" ADD COLUMN "lastConfirmedAt" TIMESTAMP(3);
ALTER TABLE "Product" ADD COLUMN "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Product" ADD COLUMN "archivedAt" TIMESTAMP(3);

UPDATE "Product"
SET "publicReference" = 'OSH-PRD-' || UPPER(SUBSTRING(MD5("id") FROM 1 FOR 8));

ALTER TABLE "Product" ALTER COLUMN "publicReference" SET NOT NULL;
CREATE UNIQUE INDEX "Product_publicReference_key" ON "Product"("publicReference");

ALTER TABLE "Seller" ADD COLUMN "accessTokenHash" TEXT;
ALTER TABLE "Seller" ADD COLUMN "accessTokenExpiresAt" TIMESTAMP(3);
ALTER TABLE "Seller" ADD COLUMN "accessRevokedAt" TIMESTAMP(3);
ALTER TABLE "Seller" ADD COLUMN "verifiedAt" TIMESTAMP(3);
ALTER TABLE "Seller" ADD COLUMN "suspendedAt" TIMESTAMP(3);
CREATE UNIQUE INDEX "Seller_accessTokenHash_key" ON "Seller"("accessTokenHash");

ALTER TABLE "ProductSubmission" ADD COLUMN "sellerId" TEXT;

ALTER TABLE "CustomerEnquiry" ADD COLUMN "publicReference" TEXT;
UPDATE "CustomerEnquiry"
SET "publicReference" = 'OSH-ENQ-' || UPPER(SUBSTRING(MD5("id") FROM 1 FOR 8));
ALTER TABLE "CustomerEnquiry" ALTER COLUMN "publicReference" SET NOT NULL;
CREATE UNIQUE INDEX "CustomerEnquiry_publicReference_key" ON "CustomerEnquiry"("publicReference");

CREATE TABLE "AdminUser" (
  "id" TEXT NOT NULL,
  "username" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'admin',
  "active" BOOLEAN NOT NULL DEFAULT true,
  "lastLoginAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "AdminUser_username_key" ON "AdminUser"("username");

CREATE TABLE "AdminSession" (
  "id" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "userAgent" TEXT,
  "ipAddress" TEXT,
  "adminId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AdminSession_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "AdminSession_tokenHash_key" ON "AdminSession"("tokenHash");
CREATE INDEX "AdminSession_expiresAt_idx" ON "AdminSession"("expiresAt");
ALTER TABLE "AdminSession" ADD CONSTRAINT "AdminSession_adminId_fkey"
  FOREIGN KEY ("adminId") REFERENCES "AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "AuditLog" (
  "id" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT,
  "metadata" JSONB,
  "ipAddress" TEXT,
  "adminId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_adminId_fkey"
  FOREIGN KEY ("adminId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "MarketplaceReport" (
  "id" TEXT NOT NULL,
  "publicReference" TEXT NOT NULL,
  "reportType" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "details" TEXT NOT NULL,
  "reporterName" TEXT,
  "reporterEmail" TEXT,
  "reporterPhone" TEXT,
  "productId" TEXT,
  "sellerId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'new',
  "adminNote" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MarketplaceReport_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "MarketplaceReport_publicReference_key" ON "MarketplaceReport"("publicReference");
CREATE INDEX "MarketplaceReport_status_createdAt_idx" ON "MarketplaceReport"("status", "createdAt");
CREATE INDEX "MarketplaceReport_productId_idx" ON "MarketplaceReport"("productId");
CREATE INDEX "MarketplaceReport_sellerId_idx" ON "MarketplaceReport"("sellerId");
ALTER TABLE "MarketplaceReport" ADD CONSTRAINT "MarketplaceReport_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MarketplaceReport" ADD CONSTRAINT "MarketplaceReport_sellerId_fkey"
  FOREIGN KEY ("sellerId") REFERENCES "Seller"("id") ON DELETE SET NULL ON UPDATE CASCADE;
