// ServiceProviderMapController.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/public/service/list?page=1&limit=12
const getServiceProviderMapList = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1; // Default to page 1
    const limit = parseInt(req.query.limit as string) || 12; // Default to 12 items per page
    const skip = (page - 1) * limit; // Calculate the number of items to skip
    const searchQuery = req.query.query as string | undefined;
    const category = req.query.category as string | undefined;
    const service = req.query.service as string | undefined;
    const wilaya = req.query.wilaya as string | undefined;

    const where = {
      AND: [] as any[], // Initialize as an empty array of any type
    };

    if (searchQuery) {
      where.AND.push({
        OR: [
          {
            service: {
              service_name: {
                contains: searchQuery,
                mode: "insensitive",
              },
            },
          },
          {
            service: {
              service_category: {
                category_name: {
                  contains: searchQuery,
                  mode: "insensitive",
                },
              },
            },
          },
        ],
      });
    }

    if (category) {
      where.AND.push({
        service: {
          service_category_id: parseInt(category),
        },
      });
    }

    if (service) {
      where.AND.push({
        service_id: parseInt(service),
      });
    }

    if (wilaya) {
      where.AND.push({
        provider: {
          addresses: {
            some: {
              wilaya: wilaya,
            },
          },
        },
      });
    }

    const serviceProviderMaps = await prisma.serviceProviderMap.findMany({
      where,
      include: {
        service: {
          include: {
            service_category: true,
          },
        },
        provider: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            addresses: true,
          },
        },
        service_delivery_offer: true,
      },
      skip,
      take: limit, // Limit the number of items returned
    });

    const totalCount = await prisma.serviceProviderMap.count({ where }); // Get the total count of items
    const totalPages = Math.ceil(totalCount / limit); // Calculate the total number of pages

    res.json({ serviceProviderMaps, totalPages });
  } catch (error) {
    console.error("Error fetching service provider maps:", error);
    res.status(500).json({ message: "Error fetching service provider maps" });
  }
};

// GET /api/public/service/category/:categoryId
const getServicesByCategory = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const services = await prisma.service.findMany({
      where: { service_category_id: Number(categoryId) }, // Filter services by category ID
      include: {
        service_category: true,
        service_providers: {
          include: {
            provider: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    res.json(services);
  } catch (error) {
    console.error("Error fetching services by category:", error);
    res.status(500).json({ message: "Error fetching services by category" });
  }
};

export default {
  getServicesByCategory,
  getServiceProviderMapList,
};
