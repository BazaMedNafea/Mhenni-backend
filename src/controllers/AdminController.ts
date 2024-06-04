import { randomBytes } from "crypto";
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = randomBytes(64).toString("hex");

export const signIn = async (
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>> | void> => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
        },
        admin: {
          isNot: null,
        },
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found or not an admin" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id, isAdmin: true }, JWT_SECRET, {
      expiresIn: "1h",
    });

    return res.status(200).json({ token });
  } catch (error: any) {
    console.error("Sign-in error:", error.message);
    return res
      .status(500)
      .json({ message: "Error signing in. Please try again." });
  }
};

export const getLoggedInAdminId = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decodedToken: any = jwt.verify(token, JWT_SECRET);
    const userId = decodedToken.userId;

    const admin = await prisma.user.findFirst({
      where: {
        id: userId,
        admin: {
          isNot: null,
        },
      },
      select: {
        id: true,
      },
    });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    return res.status(200).json({ adminId: admin.id });
  } catch (error) {
    console.error("Error fetching logged-in admin ID:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAdminImage = async (req: Request, res: Response) => {
  const adminId = req.params.adminId;

  try {
    const admin = await prisma.user.findFirst({
      where: {
        id: adminId,
        admin: {
          isNot: null,
        },
      },
      select: {
        image: true,
      },
    });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    return res.status(200).json({ imageUrl: admin.image });
  } catch (error) {
    console.error("Error fetching admin image:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAdminEmail = async (req: Request, res: Response) => {
  const adminId = req.params.adminId;

  try {
    const admin = await prisma.user.findFirst({
      where: {
        id: adminId,
        admin: {
          isNot: null,
        },
      },
      select: {
        email: true,
      },
    });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    return res.status(200).json({ email: admin.email });
  } catch (error) {
    console.error("Error fetching admin email:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get the list of all categories
export const listCategories = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const categories = await prisma.category.findMany();
    res.status(200).json({ categories });
  } catch (error: any) {
    console.error("Error fetching categories:", error.message);
    res
      .status(500)
      .json({ message: "Error fetching categories. Please try again." });
  }
};

// Add a new category
export const addCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { category_name, image } = req.body;

  try {
    const newCategory = await prisma.category.create({
      data: {
        category_name,
        image,
      },
    });

    res.status(201).json({ category: newCategory });
  } catch (error: any) {
    console.error("Error adding category:", error.message);
    res
      .status(500)
      .json({ message: "Error adding category. Please try again." });
  }
};

// Update an existing category
export const updateCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { category_name, image } = req.body;

  try {
    const updatedCategory = await prisma.category.update({
      where: { id: parseInt(id, 10) },
      data: {
        category_name,
        image,
      },
    });

    res.status(200).json(updatedCategory);
  } catch (error: any) {
    console.error("Error updating category:", error.message);
    res
      .status(500)
      .json({ message: "Error updating category. Please try again." });
  }
};

// Delete a category
export const deleteCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    await prisma.category.delete({
      where: { id: parseInt(id, 10) },
    });

    res.status(204).json({ message: "Category deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting category:", error.message);
    res
      .status(500)
      .json({ message: "Error deleting category. Please try again." });
  }
};

export const listProviders = async (req: Request, res: Response) => {
  try {
    const providers = await prisma.provider.findMany({
      include: {
        user: true,
      },
    });
    res.status(200).json({ providers });
  } catch (error) {
    res.status(500).json({ error: "Error fetching providers" });
  }
};

export const listCustomers = async (req: Request, res: Response) => {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        user: true,
      },
    });
    res.status(200).json({ customers });
  } catch (error) {
    res.status(500).json({ error: "Error fetching customers" });
  }
};

// List all services
export const listServices = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const services = await prisma.service.findMany();
    res.status(200).json({ services });
  } catch (error: any) {
    console.error("Error fetching services:", error.message);
    res
      .status(500)
      .json({ message: "Error fetching services. Please try again." });
  }
};

// Add a new service
export const addService = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { service_name, service_category_id } = req.body;

  try {
    const newService = await prisma.service.create({
      data: {
        service_name,
        service_category_id: parseInt(service_category_id, 10),
      },
    });

    res.status(201).json({ service: newService });
  } catch (error: any) {
    console.error("Error adding service:", error.message);
    res
      .status(500)
      .json({ message: "Error adding service. Please try again." });
  }
};

// Update an existing service
export const updateService = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { service_name, service_category_id } = req.body;

  try {
    const updatedService = await prisma.service.update({
      where: { id: parseInt(id, 10) },
      data: {
        service_name,
        service_category_id: parseInt(service_category_id, 10),
      },
    });

    res.status(200).json(updatedService);
  } catch (error: any) {
    console.error("Error updating service:", error.message);
    res
      .status(500)
      .json({ message: "Error updating service. Please try again." });
  }
};

// Delete a service
export const deleteService = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    await prisma.service.delete({
      where: { id: parseInt(id, 10) },
    });

    res.status(204).json({ message: "Service deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting service:", error.message);
    res
      .status(500)
      .json({ message: "Error deleting service. Please try again." });
  }
};

export const getProvider = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const provider = await prisma.provider.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!provider) {
      res.status(404).json({ message: "Provider not found" });
      return;
    }

    res.status(200).json(provider);
  } catch (error: any) {
    console.error("Error fetching provider:", error.message);
    res
      .status(500)
      .json({ message: "Error fetching provider. Please try again." });
  }
};

export const updateProvider = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { firstName, lastName, email, mobile } = req.body;

  try {
    const provider = await prisma.provider.update({
      where: { id },
      data: {
        user: {
          update: {
            firstName,
            lastName,
            email,
            mobile,
          },
        },
      },
      include: { user: true },
    });

    res.status(200).json({ provider });
  } catch (error: any) {
    console.error("Error updating provider:", error.message);
    res
      .status(500)
      .json({ message: "Error updating provider. Please try again." });
  }
};

export const deleteProvider = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    await prisma.provider.delete({
      where: { id },
    });

    res.status(204).json({ message: "Provider deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting provider:", error.message);
    res
      .status(500)
      .json({ message: "Error deleting provider. Please try again." });
  }
};

export const getCustomerById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!customer) {
      res.status(404).json({ message: "Customer not found" });
      return;
    }

    res.status(200).json(customer);
  } catch (error: any) {
    console.error("Error fetching customer:", error.message);
    res
      .status(500)
      .json({ message: "Error fetching customer. Please try again." });
  }
};

export const updateCustomer = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { firstName, lastName, email, mobile } = req.body;

  try {
    const customer = await prisma.customer.update({
      where: { id },
      data: {
        user: {
          update: {
            firstName,
            lastName,
            email,
            mobile,
          },
        },
      },
      include: { user: true },
    });

    res.status(200).json({ customer });
  } catch (error: any) {
    console.error("Error updating customer:", error.message);
    res
      .status(500)
      .json({ message: "Error updating customer. Please try again." });
  }
};

export const deleteCustomer = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    await prisma.customer.delete({
      where: { id },
    });

    res.status(204).json({ message: "Customer deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting customer:", error.message);
    res
      .status(500)
      .json({ message: "Error deleting customer. Please try again." });
  }
};
