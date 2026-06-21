import { prisma } from "../config/prisma.js";
import {
  createProductSchema,
  updateProductSchema,
} from "../validators/product.validator.js";

export async function getProducts(req, res, next) {
  try {
    const {
      category,
      condition,
      location,
      make,
      model,
      year,
      q,
      seller,
    } = req.query;

    const searchTerms = [q, make, model, year].filter(Boolean);
    const where = {
      ...(category && category !== "all" && {
        category: {
          slug: category,
        },
      }),
      ...(condition && condition !== "all" && {
        condition: {
          contains: condition,
          mode: "insensitive",
        },
      }),
      ...(location && {
        location: {
          contains: location,
          mode: "insensitive",
        },
      }),
      ...(seller && {
        OR: [
          {
            seller: {
              slug: seller,
            },
          },
          {
            sellerName: {
              contains: seller,
              mode: "insensitive",
            },
          },
        ],
      }),
      ...(searchTerms.length > 0 && {
        AND: searchTerms.map((term) => ({
          OR: [
            { name: { contains: term, mode: "insensitive" } },
            { description: { contains: term, mode: "insensitive" } },
            { location: { contains: term, mode: "insensitive" } },
            { condition: { contains: term, mode: "insensitive" } },
            { vehicleMakeModel: { contains: term, mode: "insensitive" } },
            { yearRange: { contains: term, mode: "insensitive" } },
            { brand: { contains: term, mode: "insensitive" } },
            { batterySize: { contains: term, mode: "insensitive" } },
            { category: { name: { contains: term, mode: "insensitive" } } },
          ],
        })),
      }),
    };

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        seller: true,
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
      imageUrls,
      sellerName,
      sellerWhatsapp,
      sellerSlug,
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

    const seller = sellerSlug
      ? await prisma.seller.findUnique({
          where: {
            slug: sellerSlug,
          },
        })
      : null;

    if (sellerSlug && !seller) {
      return res.status(400).json({
        message: "Invalid sellerSlug",
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
        imageUrls: imageUrls ?? [],
        sellerName: seller?.name ?? sellerName,
        sellerWhatsapp: seller?.whatsapp ?? sellerWhatsapp,
        sellerId: seller?.id,
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
        seller: true,
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
      imageUrls,
      sellerName,
      sellerWhatsapp,
      sellerSlug,
      vehicleMakeModel,
      yearRange,
      position,
      brand,
      batterySize,
      inStock,
      categorySlug,
    } = validatedData;

    let categoryId = existingProduct.categoryId;
    let sellerId = existingProduct.sellerId;
    let linkedSeller = null;

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

    if (sellerSlug !== undefined) {
      if (sellerSlug) {
        linkedSeller = await prisma.seller.findUnique({
          where: {
            slug: sellerSlug,
          },
        });

        if (!linkedSeller) {
          return res.status(400).json({
            message: "Invalid sellerSlug",
            status: "error",
          });
        }

        sellerId = linkedSeller.id;
      } else {
        sellerId = null;
      }
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
        ...(imageUrls !== undefined && { imageUrls }),
        ...(sellerName !== undefined && { sellerName }),
        ...(sellerWhatsapp !== undefined && { sellerWhatsapp }),
        ...(linkedSeller && { sellerName: linkedSeller.name, sellerWhatsapp: linkedSeller.whatsapp }),
        ...(sellerSlug !== undefined && { sellerId }),
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
        seller: true,
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
