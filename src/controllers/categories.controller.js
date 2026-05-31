import { prisma } from "../config/prisma.js";

export async function getCategories(req, res, next) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
    });

    res.json({
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
}
