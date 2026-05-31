import { products } from "../data/products.js";

export function getProducts(req, res) {
  const { category } = req.query;

  const filteredProducts = category
    ? products.filter((product) => product.categoryId === category)
    : products;

  res.json({
    count: filteredProducts.length,
    data: filteredProducts,
  });
}

export function getProductById(req, res) {
  const product = products.find((item) => item.id === req.params.id);

  if (!product) {
    return res.status(404).json({
      message: "Product not found",
    });
  }

  return res.json({
    data: product,
  });
}
