import { Request, Response } from "express";
import { PrismaClient, User, Address } from "@prisma/client";
import bcrypt from "bcrypt"; // Import bcrypt for password hashing
const prisma = new PrismaClient();

const registerUser = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, image, email, password, auth0Id, type } =
      req.body;

    // Check if email and type are present in the request body
    if (!email || !type) {
      return res.status(400).json({
        message: "Email or type is missing in the request body",
      });
    }

    let hashedPassword = ""; // Initialize hashedPassword variable

    // Check if password is provided
    if (password) {
      // Hash the provided password
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Check if the email is already registered
    const existingUser = await prisma.user.findFirst({
      where: { email }, // Use email for the where property
    });

    if (existingUser) {
      // User already exists, return an error
      return res
        .status(201)
        .json({ message: "User with this email already exists" });
    }

    // User doesn't exist, create a new user
    const newUser = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        image,
        password: hashedPassword, // Store hashed password if provided
        type,
        auth0Id,
        customer: {
          create: {}, // Create an empty customer record
        },
      },
    });

    console.log("New user created:", newUser);
    res.status(200).json(newUser);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Error creating user" });
  }
};
const getCurrentUser = async (req: Request, res: Response) => {
  try {
    // Assuming req.auth0Id contains the auth0Id of the user
    const currentCustomer = await prisma.user.findFirst({
      where: { auth0Id: req.auth0Id }, // Query based on auth0Id
      include: { customer: { include: { addresses: true } } },
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

const updateCurrentUser = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, addresses, auth0Id } = req.body;

    if (!auth0Id) {
      return res.status(400).json({ message: "auth0Id is required" });
    }

    // Update user information
    const updatedUser = await prisma.user.update({
      where: { auth0Id },
      data: {
        firstName,
        lastName,
        customer: {
          update: {
            addresses: {
              deleteMany: {}, // Delete all existing addresses
              create: addresses
                ? addresses.map((address: Address) => ({
                    street: address.street,
                    city: address.city,
                    wilaya: address.wilaya,
                    zip: address.zip,
                  }))
                : [], // Create new addresses
            },
          },
        },
      },
      include: {
        customer: {
          include: {
            addresses: true,
          },
        },
      },
    });

    res.json(updatedUser);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error updating user" });
  }
};

export default {
  registerUser,
  getCurrentUser,
  updateCurrentUser,
};
