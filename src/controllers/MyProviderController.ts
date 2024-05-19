// MyProviderController.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const addServiceForProvider = async (req: Request, res: Response) => {
  try {
    const {
      serviceId,
      billingRatePerHour,
      experienceInMonths,
      serviceOfferingDesc,
    } = req.body;
    const providerId = req.providerId; // Extract providerId from authentication token

    // Check if the service exists
    const existingService = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!existingService) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Create a new service provider map
    const serviceProviderMap = await prisma.serviceProviderMap.create({
      data: {
        service_id: serviceId,
        provider_id: providerId, // Associate the service with the authenticated provider
        billing_rate_per_hour: billingRatePerHour,
        experience_in_months: experienceInMonths,
        service_offering_desc: serviceOfferingDesc,
      },
    });

    res.status(201).json(serviceProviderMap);
  } catch (error) {
    console.error("Error adding service for provider:", error);
    res.status(500).json({ message: "Error adding service for provider" });
  }
};

const getProviderRequests = async (req: Request, res: Response) => {
  try {
    const { providerId } = req;

    if (!providerId) {
      return res.status(401).json({ message: "Provider ID not found" });
    }

    const providerRequests = await prisma.request.findMany({
      where: { providerId },
      include: {
        service: true,
        customer: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                image: true, // Include the 'image' field
              },
            },
          },
        },
        Address: true,
      },
    });

    // Map the address details to each request
    const requestsWithAddressAndImage = providerRequests.map((request) => ({
      ...request,
      customerAddress: request.Address
        ? `${request.Address.street}, ${request.Address.city}, ${request.Address.wilaya}, ${request.Address.zip}`
        : "No address provided",
      customerImage: request.customer?.user?.image || "", // Access the user's image
    }));

    res.json(requestsWithAddressAndImage);
  } catch (error) {
    console.error("Error fetching provider requests:", error);
    res.status(500).json({ message: "Error fetching provider requests" });
  }
};

export default {
  addServiceForProvider,
  getProviderRequests,
};
