import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const getServiceList = async (req: Request, res: Response) => {
  const providerId = req.customerId; // Assuming you store provider ID in customerId

  // Perform a null check to handle potential undefined value
  if (providerId === undefined) {
    return res.status(400).json({ error: "Provider ID is missing" });
  }

  try {
    // Use Prisma to query services associated with the provider
    const services = await prisma.service.findMany({
      where: {
        service_providers: { some: { provider_id: parseInt(providerId) } },
      },
      include: { service_category: true },
    });

    return res.status(200).json({ services });
  } catch (error) {
    console.error("Error fetching services:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
const getMyServiceById = async (req: Request, res: Response) => {
  // Extract serviceId from the request parameters
  const serviceId = req.params.serviceId;

  try {
    // Here you can fetch the service details based on the serviceId and logged in provider
    // Add your logic here to fetch the service details

    // For now, let's send a dummy response
    return res.json({
      serviceId,
      serviceName: "Dummy Service",
      category: {
        categoryId: 1,
        categoryName: "Dummy Category",
      },
    });
  } catch (error) {
    console.error("Error fetching service:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const createMyService = async (req: Request, res: Response) => {
  const { serviceName, categoryId } = req.body;

  try {
    // Create the service in the database
    // Add your logic here to create the service

    // For now, let's send a dummy response
    return res.status(201).json({
      message: "Service created successfully",
      serviceName,
      categoryId,
    });
  } catch (error) {
    console.error("Error creating service:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
const updateMyService = async (req: Request, res: Response) => {
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
const deleteMyService = async (req: Request, res: Response) => {
  const serviceId = req.params.serviceId;

  try {
    // Delete the service from the database
    // Add your logic here to delete the service

    // For now, let's send a dummy response
    return res.json({ message: "Service deleted successfully", serviceId });
  } catch (error) {
    console.error("Error deleting service:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export default {
  deleteMyService,
  updateMyService,
  createMyService,
  getServiceList,
  getMyServiceById,
};
