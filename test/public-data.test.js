import { describe, expect, it } from "vitest";
import { sanitizePublicProduct, sanitizePublicSeller } from "../src/utils/public-data.js";

const databaseSeller = {
  id: "seller-1",
  name: "Test Seller",
  slug: "test-seller",
  whatsapp: "+2349000000000",
  phone: null,
  location: "Lagos",
  coverageArea: "Nigeria",
  specialty: "Suspension",
  description: "A reviewed seller.",
  verified: true,
  rating: "5.0",
  accessCode: "legacy-secret",
  accessTokenHash: "token-hash",
  accessTokenExpiresAt: new Date("2026-12-01T00:00:00.000Z"),
  accessRevokedAt: null,
  suspendedAt: null,
  verifiedAt: new Date("2026-07-01T00:00:00.000Z"),
  createdAt: new Date("2026-07-01T00:00:00.000Z"),
  updatedAt: new Date("2026-08-01T00:00:00.000Z"),
};

describe("public API serialization", () => {
  it("returns only explicitly approved seller fields", () => {
    expect(sanitizePublicSeller(databaseSeller)).toEqual({
      id: "seller-1",
      name: "Test Seller",
      slug: "test-seller",
      whatsapp: "+2349000000000",
      phone: null,
      location: "Lagos",
      coverageArea: "Nigeria",
      specialty: "Suspension",
      description: "A reviewed seller.",
      verified: true,
      rating: "5.0",
    });
  });

  it("removes seller credentials from public product responses", () => {
    const product = sanitizePublicProduct({
      id: "product-1",
      name: "Test Product",
      seller: databaseSeller,
    });

    expect(product.name).toBe("Test Product");
    expect(product.seller.slug).toBe("test-seller");
    expect(product.seller).not.toHaveProperty("accessCode");
    expect(product.seller).not.toHaveProperty("accessTokenHash");
    expect(product.seller).not.toHaveProperty("accessTokenExpiresAt");
    expect(product.seller).not.toHaveProperty("accessRevokedAt");
  });

  it("preserves products without a linked seller", () => {
    expect(sanitizePublicProduct({ id: "product-2", seller: null })).toEqual({
      id: "product-2",
      seller: null,
    });
  });
});
