import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import path from "path";
import { authenticateJwt } from "../middleware/auth"; // Import the authentication middleware

const prisma = new PrismaClient();

const registerAdmin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the admin user with the hashed password
    const newAdmin = await prisma.admin.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    return res.status(201).json({
      message: "Admin created successfully",
      admin: newAdmin,
    });
  } catch (error) {
    console.error("Error creating admin:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const loginAdmin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // Find the admin with the provided email
    const admin = await prisma.admin.findFirst({
      where: {
        email: {
          equals: email.toLowerCase(),
        },
      },
    });

    // If admin not found, return 401 (Unauthorized)
    if (!admin) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Compare hashed password with provided password
    const passwordMatch = await bcrypt.compare(password, admin.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // If passwords match, generate JWT and return it
    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      "your_secret_key",
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (error) {
    console.error("Error signing in admin:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getAdminImage = async (req: Request, res: Response) => {
  try {
    const adminId = parseInt(req.params.adminId);

    // Find the admin by ID
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    // Check if admin.image is a valid URL
    if (!admin.image || !isValidUrl(admin.image)) {
      return res.status(404).json({ error: "Image not found for admin" });
    }

    // Return the admin image URL directly
    res.json({ imageUrl: admin.image });
  } catch (error) {
    console.error("Error fetching admin image:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Helper function to check if a string is a valid URL
function isValidUrl(urlString: string) {
  try {
    new URL(urlString);
    return true;
  } catch (_) {
    return false;
  }
}

const getAdminIdByEmail = async (req: Request, res: Response) => {
  const { email } = req.params;
  try {
    const admin = await prisma.admin.findFirst({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true },
    });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    return res.json({ adminId: admin.id, email: admin.email });
  } catch (error) {
    console.error("Error retrieving admin ID:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
const getLoggedInAdminId = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header missing" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, "your_secret_key");
    const adminId = (decoded as { id: number }).id;
    return res.json({ adminId });
  } catch (error) {
    console.error("Error verifying token:", error);
    return res.status(401).json({ error: "Invalid token" });
  }
};
// Controller function to fetch admin's email by admin ID
const getAdminEmailById = async (req: Request, res: Response) => {
  const { adminId } = req.params;
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: parseInt(adminId) },
      select: { email: true },
    });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    return res.json({ email: admin.email });
  } catch (error) {
    console.error("Error retrieving admin email:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export default {
  getAdminEmailById,
  getAdminImage,
  registerAdmin,
  loginAdmin,
  getAdminIdByEmail,
  getLoggedInAdminId,
};
