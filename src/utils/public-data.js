const PUBLIC_SELLER_FIELDS = [
  "id",
  "name",
  "slug",
  "whatsapp",
  "phone",
  "location",
  "coverageArea",
  "specialty",
  "description",
  "verified",
  "rating",
];

export function sanitizePublicSeller(seller) {
  if (!seller) return seller;

  return Object.fromEntries(
    PUBLIC_SELLER_FIELDS
      .filter((field) => seller[field] !== undefined)
      .map((field) => [field, seller[field]]),
  );
}

export function sanitizePublicProduct(product) {
  if (!product) return product;

  return {
    ...product,
    seller: sanitizePublicSeller(product.seller),
  };
}
