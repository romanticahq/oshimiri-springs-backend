CREATE TABLE "CustomerEnquiry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "whatsapp" TEXT,
    "preferredContact" TEXT NOT NULL DEFAULT 'email',
    "enquiryType" TEXT NOT NULL DEFAULT 'part',
    "partName" TEXT,
    "vehicleDetails" TEXT,
    "location" TEXT,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerEnquiry_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CustomerEnquiry_status_createdAt_idx"
ON "CustomerEnquiry"("status", "createdAt");
