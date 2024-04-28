import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const getProvidersList = async (req: Request, res: Response) => {
  try {
    const providers = await prisma.provider.findMany();
    return res.json({ providers });
  } catch (error) {
    console.error("Error fetching providers:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const getProviderById = async (req: Request, res: Response) => {
  const providerId = parseInt(req.params.providerId);

  try {
    const provider = await prisma.provider.findUnique({
      where: {
        id: providerId,
      },
    });

    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    res.json(provider); // Check if this line is returning the correct data structure
  } catch (error) {
    console.error("Error fetching provider:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const createProvider = async (req: Request, res: Response) => {
  const { firstName, lastName, email, mobileNumber, description } = req.body;

  try {
    const newProvider = await prisma.provider.create({
      data: {
        first_name: firstName,
        last_name: lastName,
        email,
        mobile_number: mobileNumber,
        description,
        // Add the missing properties with default values or appropriate values
        auth0Id: "", // Example: Set default value or retrieve from request
        is_individual: true, // Example: Set default value or retrieve from request
        is_registered_office: false, // Example: Set default value or retrieve from request
        zip: "", // Example: Set default value or retrieve from request
      },
    });

    res.status(201).json({
      message: "Provider created successfully",
      provider: newProvider,
    });
  } catch (error) {
    console.error("Error creating provider:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateProvider = async (req: Request, res: Response) => {
  const providerId = parseInt(req.params.providerId);
  const { first_name, last_name, email, mobile_number, description } = req.body;

  try {
    // Log the received request body fields to debug
    console.log("Request Body:", req.body);

    // Ensure all required fields are present in the request body
    if (!first_name || !last_name || !email || !mobile_number || !description) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const updatedProvider = await prisma.provider.update({
      where: {
        id: providerId,
      },
      data: {
        first_name,
        last_name,
        email,
        mobile_number,
        description,
      },
    });

    res.json({
      message: "Provider updated successfully",
      provider: updatedProvider,
    });
  } catch (error) {
    console.error("Error updating provider:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteProvider = async (req: Request, res: Response) => {
  const providerId = parseInt(req.params.providerId);

  try {
    // Use Prisma to delete the provider by ID
    await prisma.provider.delete({
      where: { id: providerId },
    });

    return res.status(200).json({ message: "Provider deleted successfully" });
  } catch (error) {
    console.error("Error deleting provider:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const getProviderRatings = async (req: Request, res: Response) => {
  const providerId = parseInt(req.params.providerId);

  try {
    // Use Prisma to query ratings associated with the provider
    const ratings = await prisma.provider_rating.findMany({
      where: { provider_id: providerId },
    });

    return res.status(200).json({ ratings });
  } catch (error) {
    console.error("Error fetching provider ratings:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export default {
  getProviderRatings,
  deleteProvider,
  updateProvider,
  createProvider,
  getProvidersList,
  getProviderById,
};
