ALTER TABLE "Seller" ADD COLUMN "accessCode" TEXT;
ALTER TABLE "ProductSubmission" ADD COLUMN "sellerAccessCode" TEXT;

CREATE UNIQUE INDEX "Seller_accessCode_key" ON "Seller"("accessCode");
