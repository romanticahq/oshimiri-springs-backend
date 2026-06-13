import { prisma } from "../config/prisma.js";
import {
  createProductSchema,
  updateProductSchema,
} from "../validators/product.validator.js";

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
    const validatedData = createProductSchema.parse(req.body);

    const {
      name,
      slug,
      description,
      price,
      currency,
      condition,
      location,
      imageUrl,
      sellerName,
      sellerWhatsapp,
      vehicleMakeModel,
      yearRange,
      position,
      brand,
      batterySize,
      inStock,
      categorySlug,
    } = validatedData;

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
        price,
        currency,
        condition,
        location,
        imageUrl,
        sellerName,
        sellerWhatsapp,
        vehicleMakeModel,
        yearRange,
        position,
        brand,
        batterySize,
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
    if (error.name === "ZodError") {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.issues,
        status: "error",
      });
    }

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
    const validatedData = updateProductSchema.parse(req.body);

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
      sellerName,
      sellerWhatsapp,
      vehicleMakeModel,
      yearRange,
      position,
      brand,
      batterySize,
      inStock,
      categorySlug,
    } = validatedData;

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
        ...(price !== undefined && { price }),
        ...(currency !== undefined && { currency }),
        ...(condition !== undefined && { condition }),
        ...(location !== undefined && { location }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(sellerName !== undefined && { sellerName }),
        ...(sellerWhatsapp !== undefined && { sellerWhatsapp }),
        ...(vehicleMakeModel !== undefined && { vehicleMakeModel }),
        ...(yearRange !== undefined && { yearRange }),
        ...(position !== undefined && { position }),
        ...(brand !== undefined && { brand }),
        ...(batterySize !== undefined && { batterySize }),
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
    if (error.name === "ZodError") {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.issues,
        status: "error",
      });
    }

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
