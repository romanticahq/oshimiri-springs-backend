import { prisma } from "../config/prisma.js";
import {
  createEngineerSchema,
  updateEngineerSchema,
} from "../validators/engineer.validator.js";

export async function getEngineers(req, res, next) {
  try {
    const { location, specialty, q } = req.query;
    const engineers = await prisma.engineer.findMany({
      where: {
        ...(location && {
          location: {
            contains: location,
            mode: "insensitive",
          },
        }),
        ...(specialty && {
          specialty: {
            contains: specialty,
            mode: "insensitive",
          },
        }),
        ...(q && {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { location: { contains: q, mode: "insensitive" } },
            { specialty: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        }),
      },
      orderBy: {
        name: "asc",
      },
    });

    res.json({
      count: engineers.length,
      data: engineers,
    });
  } catch (error) {
    next(error);
  }
}

export async function createEngineer(req, res, next) {
  try {
    const data = createEngineerSchema.parse(req.body);
    const engineer = await prisma.engineer.create({
      data: {
        ...data,
        verified: data.verified ?? false,
      },
    });

    res.status(201).json({
      message: "Engineer created successfully",
      data: engineer,
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
        message: "An engineer with this slug already exists",
        status: "error",
      });
    }

    next(error);
  }
}

export async function updateEngineer(req, res, next) {
  try {
    const data = updateEngineerSchema.parse(req.body);
    const engineer = await prisma.engineer.update({
      where: {
        slug: req.params.id,
      },
      data,
    });

    res.json({
      message: "Engineer updated successfully",
      data: engineer,
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.issues,
        status: "error",
      });
    }

    if (error.code === "P2025") {
      return res.status(404).json({
        message: "Engineer not found",
        status: "error",
      });
    }

    if (error.code === "P2002") {
      return res.status(409).json({
        message: "An engineer with this slug already exists",
        status: "error",
      });
    }

    next(error);
  }
}

export async function deleteEngineer(req, res, next) {
  try {
    await prisma.engineer.delete({
      where: {
        slug: req.params.id,
      },
    });

    res.json({
      message: "Engineer deleted successfully",
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        message: "Engineer not found",
        status: "error",
      });
    }

    next(error);
  }
}
