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

export async function createProduct(req, res, next) {
  try {
    const {
      name,
      slug,
      description,
      price,
      currency,
      condition,
      location,
      imageUrl,
      inStock,
      categorySlug,
    } = req.body;

    if (!name || !slug || !price || !condition || !location || !categorySlug) {
      return res.status(400).json({
        message:
          "name, slug, price, condition, location, and categorySlug are required",
        status: "error",
      });
    }

    const category = await prisma.category.findUnique({
      where: {
        slug: categorySlug,
      },
    });

    if (!category) {
      return res.status(400).json({
        message: "Invalid categorySlug",
        status: "error",
      });
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: Number(price),
        currency: currency || "NGN",
        condition,
        location,
        imageUrl,
        inStock: inStock ?? true,
        categoryId: category.id,
      },
      include: {
        category: true,
      },
    });

    return res.status(201).json({
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        message: "A product with this slug already exists",
        status: "error",
      });
    }

    next(error);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const existingProduct = await prisma.product.findUnique({
      where: {
        slug: req.params.id,
      },
    });

    if (!existingProduct) {
      return res.status(404).json({
        message: "Product not found",
        status: "error",
      });
    }

    const {
      name,
      slug,
      description,
      price,
      currency,
      condition,
      location,
      imageUrl,
      inStock,
      categorySlug,
    } = req.body;

    let categoryId = existingProduct.categoryId;

    if (categorySlug) {
      const category = await prisma.category.findUnique({
        where: {
          slug: categorySlug,
        },
      });

      if (!category) {
        return res.status(400).json({
          message: "Invalid categorySlug",
          status: "error",
        });
      }

      categoryId = category.id;
    }

    const product = await prisma.product.update({
      where: {
        slug: req.params.id,
      },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: Number(price) }),
        ...(currency !== undefined && { currency }),
        ...(condition !== undefined && { condition }),
        ...(location !== undefined && { location }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(inStock !== undefined && { inStock }),
        categoryId,
      },
      include: {
        category: true,
      },
    });

    return res.json({
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        message: "A product with this slug already exists",
        status: "error",
      });
    }

    next(error);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    const existingProduct = await prisma.product.findUnique({
      where: {
        slug: req.params.id,
      },
    });

    if (!existingProduct) {
      return res.status(404).json({
        message: "Product not found",
        status: "error",
      });
    }

    await prisma.product.delete({
      where: {
        slug: req.params.id,
      },
    });

    return res.json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}
