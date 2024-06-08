import { Request, Response } from "express";
import { PrismaClient, User, Address, UserType } from "@prisma/client";
import bcrypt from "bcrypt"; // Import bcrypt for password hashing
import cloudinary from "cloudinary";

const prisma = new PrismaClient();

const registerUser = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, image, email, password, auth0Id, type } =
      req.body;

    // Check if email and type are present in the request body
    if (!email) {
      return res.status(400).json({
        message: "Email is missing in the request body",
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
        type: type || null, //
        auth0Id,
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
      include: {
        customer: { include: { addresses: true } },
        provider: { include: { addresses: true } },
      },
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
    const { firstName, lastName, addresses, auth0Id, type, bio } = req.body;

    if (!auth0Id) {
      return res.status(400).json({ message: "auth0Id is required" });
    }

    // Update user information
    const updatedUser = await prisma.user.update({
      where: { auth0Id },
      data: { firstName, lastName, type, bio }, // Include the 'bio' field
      include: {
        customer: true,
        provider: true,
      },
    });

    // If the user is of type 'Customer'
    if (type === UserType.Customer) {
      // Create a customer record if it doesn't exist
      if (!updatedUser.customer) {
        const newCustomer = await prisma.customer.create({
          data: {
            userId: updatedUser.id,
          },
        });
        updatedUser.customer = newCustomer;
      }
    }

    // If the user is of type 'Provider'
    if (type === UserType.Provider) {
      // Create a provider record if it doesn't exist
      if (!updatedUser.provider) {
        const newProvider = await prisma.provider.create({
          data: {
            userId: updatedUser.id,
          },
        });
        updatedUser.provider = newProvider;
      }
    }

    // Update addresses if provided
    if (addresses && addresses.length > 0) {
      const customerId = updatedUser.customer?.id ?? null;
      const providerId = updatedUser.provider?.id ?? null;

      // Find the existing address for the user
      const existingAddress = await prisma.address.findFirst({
        where: {
          customerId,
          providerId,
        },
      });

      if (existingAddress) {
        // Update the existing address
        await prisma.address.update({
          where: { id: existingAddress.id },
          data: addresses[0], // Assuming only one address is provided
        });
      } else {
        // Create a new address
        await prisma.address.create({
          data: {
            ...addresses[0], // Assuming only one address is provided
            customerId,
            providerId,
          },
        });
      }
    }

    // Return the updated user
    res.json(updatedUser);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error updating user" });
  }
};

const updateUserType = async (req: Request, res: Response) => {
  try {
    const { auth0Id, type } = req.body;

    if (!auth0Id || !type) {
      return res.status(400).json({ message: "auth0Id and type are required" });
    }

    const updatedUser = await prisma.user.update({
      where: { auth0Id },
      data: { type },
    });

    res.json(updatedUser);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error updating user type" });
  }
};

const updateUserProfilePicture = async (req: Request, res: Response) => {
  try {
    const image = req.file as Express.Multer.File;
    if (!image) {
      return res.status(400).json({ message: "No image provided" });
    }

    const base64Image = Buffer.from(image.buffer).toString("base64");
    const dataURI = `data:${image.mimetype};base64,${base64Image}`;

    // Upload image to Cloudinary
    const uploadResponse = await cloudinary.v2.uploader.upload(dataURI);

    // Get the auth0Id from the request (assuming it's set in the middleware)
    const { auth0Id } = req;

    if (!auth0Id) {
      return res.status(400).json({ message: "auth0Id is required" });
    }

    // Update the user's image with the Cloudinary URL
    const updatedUser = await prisma.user.update({
      where: { auth0Id },
      data: { image: uploadResponse.secure_url },
    });

    res.json(updatedUser);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error updating user profile picture" });
  }
};

export default {
  registerUser,
  getCurrentUser,
  updateCurrentUser,
  updateUserType,
  updateUserProfilePicture,
};
