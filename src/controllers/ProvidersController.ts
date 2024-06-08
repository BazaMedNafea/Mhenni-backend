// ProvidersController.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/public/provider/service/:serviceId
const getProvidersByService = async (req: Request, res: Response) => {
  try {
    const { serviceId } = req.params;
    const providers = await prisma.serviceProviderMap.findMany({
      where: { service_id: Number(serviceId) },
      include: {
        provider: {
          include: {
            providerRatings: true,
            addresses: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                bio: true,
              },
            },
          },
        },
        service: true, // Include service details
      },
    });

    res.json(providers);
  } catch (error) {
    console.error("Error fetching providers:", error);
    res.status(500).json({ message: "Error fetching providers" });
  }
};

const getProviderById = async (req: Request, res: Response) => {
  try {
    const { providerId } = req.params;
    const provider = await prisma.provider.findUnique({
      where: { id: providerId },
      include: {
        providerRatings: true,
        addresses: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            image: true,
            bio: true,
          },
        },
        // Include other related models as needed
      },
    });

    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    res.json(provider);
  } catch (error) {
    console.error("Error fetching provider:", error);
    res.status(500).json({ message: "Error fetching provider" });
  }
};

const getOffersByProviderId = async (req: Request, res: Response) => {
  try {
    const { providerId } = req.params;

    // Fetch offers for the provider
    const offers = await prisma.serviceProviderMap.findMany({
      where: {
        provider_id: providerId,
      },
      include: {
        service: true, // Include the associated service details
      },
    });

    res.json(offers);
  } catch (error) {
    console.error("Error getting offers by provider ID:", error);
    res.status(500).json({ message: "Error getting offers by provider ID" });
  }
};

export default {
  getProvidersByService,
  getProviderById, // Add the new method
  getOffersByProviderId,
};
