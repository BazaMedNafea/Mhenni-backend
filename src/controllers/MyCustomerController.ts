import { Request, Response } from "express";
import { Prisma, PrismaClient, customer } from "@prisma/client";

const prisma = new PrismaClient();

const getCurrentCustomer = async (req: Request, res: Response) => {
  try {
    const currentCustomer = await prisma.customer.findFirst({
      where: { auth0Id: req.auth0Id }, // Query based on auth0Id
      include: { addresses: true },
    });
    if (!currentCustomer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json(currentCustomer);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const createCurrentCustomer = async (req: Request, res: Response) => {
  try {
    const { auth0Id } = req.body; // Assuming auth0Id is the unique identifier for the Google account

    // Check if the user already exists
    const existingCustomer = await prisma.customer.findFirst({
      where: { auth0Id: auth0Id },
    });

    if (existingCustomer) {
      // User already exists, return the existing user
      return res.status(200).json(existingCustomer);
    }

    // User doesn't exist, create a new user
    const newCustomer = await prisma.customer.create({ data: req.body });

    res.status(201).json(newCustomer);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error creating user" });
  }
};

const updateCurrentCustomer = async (req: Request, res: Response) => {
  try {
    console.log("Request body:", req.body);
    const {
      first_name,
      last_name,
      addresses,
      id,
      // Include other fields here as required
    } = req.body;
    const customerId = parseInt(req.body.id);
    console.log("Parsed customerId:", customerId);

    // Update customer information
    const updatedCustomer = await prisma.customer.update({
      where: { id: customerId },
      data: {
        first_name,
        last_name,
        // Include other fields here as required
      },
    });

    // Check if the user has an existing address
    const existingAddress = await prisma.address.findFirst({
      where: { customer_id: { equals: customerId } },
    });

    let updatedAddress;
    if (existingAddress) {
      // Update the existing address information
      updatedAddress = await prisma.address.update({
        where: { id: existingAddress.id },
        data: {
          street: addresses[0]?.street || "",
          city: addresses[0]?.city || "",
          state: addresses[0]?.state || "",
          zip: addresses[0]?.zip || "",
        },
      });
    } else {
      // Create a new address if no existing address found
      updatedAddress = await prisma.address.create({
        data: {
          customer_id: customerId,
          street: addresses[0]?.street || "",
          city: addresses[0]?.city || "",
          state: addresses[0]?.state || "",
          zip: addresses[0]?.zip || "",
        },
      });
    }

    console.log("Updated customer:", updatedCustomer);
    console.log("Updated address:", updatedAddress);

    // Send response
    res.json({ customer: updatedCustomer, address: updatedAddress });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("Error updating customer:", error.message);
      res
        .status(500)
        .json({ message: `Error updating customer: ${error.message}` });
    } else {
      console.error("Unexpected error:", error);
      res.status(500).json({ message: "An unexpected error occurred" });
    }
  }
};

export default {
  getCurrentCustomer,
  createCurrentCustomer,
  updateCurrentCustomer,
};
