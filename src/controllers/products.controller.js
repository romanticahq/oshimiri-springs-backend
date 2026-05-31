import { prisma } from "../config/prisma.js";

export async function getProducts(req, res, next) {
  try {
    const { category } = req.query;

    const products = await prisma.product.findMany({
      where: category
        ? {
            category: {
              slug: category,
            },
          }
        : undefined,
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      count: products.length,
      data: products,
    });
  } catch (error) {
    next(error);
  }
}

export async function getProductById(req, res, next) {
  try {
    const product = await prisma.product.findUnique({
      where: {
        slug: req.params.id,
      },
      include: {
        category: true,
      },
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
        status: "error",
      });
    }

    return res.json({
      data: product,
    });
  } catch (error) {
    next(error);
  }
}
