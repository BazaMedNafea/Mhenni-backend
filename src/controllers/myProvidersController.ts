import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const getLoggedInProvider = async (req: Request, res: Response) => {
  try {
    // Retrieve the logged-in provider information from the request or session
    // This could be based on the authentication mechanism you're using
    const loggedInProvider = {}; // Get the logged-in provider information

    res.json(loggedInProvider);
  } catch (error) {
    console.error("Error fetching logged-in provider:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getProviderRatings = async (req: Request, res: Response) => {
  const providerId = req.providerId; // Assuming you store provider ID in customerId

  try {
    // Use Prisma to query ratings associated with the provider
    const ratings = await prisma.provider_rating.findMany({
      where: { provider_id: parseInt(providerId) },
    });

    return res.status(200).json({ ratings });
  } catch (error) {
    console.error("Error fetching provider ratings:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export default {
  getProviderRatings,
  getLoggedInProvider,
};
