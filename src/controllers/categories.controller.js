import { categories } from "../data/categories.js";

export function getCategories(req, res) {
  res.json({
    count: categories.length,
    data: categories,
  });
}
