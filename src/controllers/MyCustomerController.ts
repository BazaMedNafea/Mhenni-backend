import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const addServiceRequest = async (req: Request, res: Response) => {
  try {
    const { serviceId, requirementDesc, providerId, customAddress } = req.body;

    // Get the customerId from the authenticated user's information
    const customerId = req.customerId;

    // Validate input data
    if (!customerId || !serviceId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Find the customer and service objects
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!customer || !service) {
      return res.status(404).json({ message: "Customer or service not found" });
    }

    // Create a new service request with initial state as PENDING
    const newRequest = await prisma.request.create({
      data: {
        customer: { connect: { id: customerId } },
        service: { connect: { id: serviceId } },
        requirement_desc: requirementDesc,
        provider: { connect: { id: providerId } },
        custom_address_street: customAddress?.street,
        custom_address_city: customAddress?.city,
        custom_address_wilaya: customAddress?.wilaya,
        custom_address_zip: customAddress?.zip,
        state: "REQUESTED", // Set initial state
      },
    });

    res.status(201).json(newRequest);
  } catch (error) {
    console.error("Error creating service request:", error);
    res.status(500).json({ message: "Error creating service request" });
  }
};

export default {
  addServiceRequest,
};
