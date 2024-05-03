import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const getServiceListWithCategories = async (req: Request, res: Response) => {
  try {
    const services = await prisma.service.findMany({
      include: {
        service_category: true, // Include the service category
        service_providers: true, // Include the associated service providers
      },
    });

    return res.json({ services });
  } catch (error) {
    console.error("Error fetching services:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const getServicesByProviderId = async (req: Request, res: Response) => {
  const providerId = parseInt(req.params.providerId);

  try {
    // Fetch the provider along with their services and associated categories
    const providerWithServices = await prisma.provider.findUnique({
      where: {
        id: providerId,
      },
      include: {
        service_provider_map: {
          include: {
            service: {
              include: {
                service_category: true,
              },
            },
          },
        },
      },
    });

    if (!providerWithServices) {
      return res.status(404).json({ message: "Provider not found" });
    }

    // Extract services with categories from the fetched data
    const services = providerWithServices.service_provider_map.map(
      (serviceMapping) => ({
        service_id: serviceMapping.service.id,
        service_name: serviceMapping.service.service_name,
        category: serviceMapping.service.service_category.category_name,
      })
    );

    res.json({ services });
  } catch (error) {
    console.error("Error fetching services by provider:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const getServiceById = async (req: Request, res: Response) => {
  const serviceId = parseInt(req.params.serviceId);

  try {
    // Fetch the service with its category included
    const service = await prisma.service.findUnique({
      where: {
        id: serviceId,
      },
      include: {
        service_category: true,
      },
    });

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.json({ service });
  } catch (error) {
    console.error("Error fetching service by ID:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const updateService = async (req: Request, res: Response) => {
  const serviceId = req.params.serviceId;
  const { serviceName, categoryId } = req.body;

  try {
    // Update the service in the database
    // Add your logic here to update the service details

    // For now, let's send a dummy response
    return res.json({
      message: "Service updated successfully",
      serviceId,
      serviceName,
      categoryId,
    });
  } catch (error) {
    console.error("Error updating service:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
const searchServicesByCategory = async (req: Request, res: Response) => {
  const category = req.query.category as string;

  try {
    // Search for services by category
    // Add your logic here to search for services by category

    // For now, let's send a dummy response
    const services = [
      { serviceName: "Service 1", category },
      { serviceName: "Service 2", category },
    ];

    return res.json({ services });
  } catch (error) {
    console.error("Error searching services by category:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export default {
  searchServicesByCategory,
  updateService,
  getServiceListWithCategories,
  getServicesByProviderId,
  getServiceById,
};
