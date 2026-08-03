import { prisma } from "../config/prisma.js";
import {
  createProductSchema,
  updateProductSchema,
} from "../validators/product.validator.js";
import { createPublicReference } from "../utils/reference.js";
import { recordAudit } from "../services/audit.js";
import { sanitizePublicProduct } from "../utils/public-data.js";

export async function getProducts(req, res, next) {
  try {
    const {
      category,
      condition,
      location,
      coverageArea,
      make,
      model,
      year,
      q,
      seller,
    } = req.query;

    const searchTerms = [q, make, model, year].filter(Boolean);
    const where = {
      archivedAt: null,
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
      ...(coverageArea && {
        coverageArea: {
          contains: coverageArea,
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
            { coverageArea: { contains: term, mode: "insensitive" } },
            { condition: { contains: term, mode: "insensitive" } },
            { vehicleMakeModel: { contains: term, mode: "insensitive" } },
            { yearRange: { contains: term, mode: "insensitive" } },
            { brand: { contains: term, mode: "insensitive" } },
            { batterySize: { contains: term, mode: "insensitive" } },
            { publicReference: { contains: term, mode: "insensitive" } },
            { vehicleMake: { contains: term, mode: "insensitive" } },
            { vehicleModel: { contains: term, mode: "insensitive" } },
            { engineCode: { contains: term, mode: "insensitive" } },
            { oemPartNumber: { contains: term, mode: "insensitive" } },
            { partNumber: { contains: term, mode: "insensitive" } },
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
      data: products.map(sanitizePublicProduct),
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
        seller: true,
      },
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
        status: "error",
      });
    }

    return res.json({
      data: sanitizePublicProduct(product),
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
      priceLabel,
      currency,
      condition,
      location,
      coverageArea,
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
      vehicleMake,
      vehicleModel,
      yearFrom,
      yearTo,
      engineCode,
      oemPartNumber,
      partNumber,
      side,
      bodyType,
      warranty,
      availabilityStatus,
      lastConfirmedAt,
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
        publicReference: createPublicReference("PRD"),
        name,
        slug,
        description,
        price,
        priceLabel,
        currency,
        condition,
        location,
        coverageArea,
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
        vehicleMake,
        vehicleModel,
        yearFrom,
        yearTo,
        engineCode,
        oemPartNumber,
        partNumber,
        side,
        bodyType,
        warranty,
        availabilityStatus: availabilityStatus ?? "available",
        lastConfirmedAt: lastConfirmedAt ?? new Date(),
        categoryId: category.id,
      },
      include: {
        category: true,
        seller: true,
      },
    });
    await recordAudit(req, "product.create", "Product", product.id);

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
      priceLabel,
      currency,
      condition,
      location,
      coverageArea,
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
      vehicleMake,
      vehicleModel,
      yearFrom,
      yearTo,
      engineCode,
      oemPartNumber,
      partNumber,
      side,
      bodyType,
      warranty,
      availabilityStatus,
      lastConfirmedAt,
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
        ...(priceLabel !== undefined && { priceLabel }),
        ...(currency !== undefined && { currency }),
        ...(condition !== undefined && { condition }),
        ...(location !== undefined && { location }),
        ...(coverageArea !== undefined && { coverageArea }),
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
        ...(vehicleMake !== undefined && { vehicleMake }),
        ...(vehicleModel !== undefined && { vehicleModel }),
        ...(yearFrom !== undefined && { yearFrom }),
        ...(yearTo !== undefined && { yearTo }),
        ...(engineCode !== undefined && { engineCode }),
        ...(oemPartNumber !== undefined && { oemPartNumber }),
        ...(partNumber !== undefined && { partNumber }),
        ...(side !== undefined && { side }),
        ...(bodyType !== undefined && { bodyType }),
        ...(warranty !== undefined && { warranty }),
        ...(availabilityStatus !== undefined && {
          availabilityStatus,
          archivedAt: availabilityStatus === "archived" ? new Date() : null,
        }),
        ...(lastConfirmedAt !== undefined && { lastConfirmedAt }),
        categoryId,
      },
      include: {
        category: true,
        seller: true,
      },
    });
    await recordAudit(req, "product.update", "Product", product.id);

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
    await recordAudit(req, "product.delete", "Product", existingProduct.id);

    return res.json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}
