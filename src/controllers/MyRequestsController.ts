// MyRequestController.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
  getProviderRequests,
};
