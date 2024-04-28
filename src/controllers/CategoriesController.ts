import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const getCategoryList = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.service_category.findMany({
      select: {
        id: true,
        category_name: true,
        image: true,
      },
    });
    return res.json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const getCategoryById = async (req: Request, res: Response) => {
  const categoryId = parseInt(req.params.categoryId);

  try {
    const category = await prisma.service_category.findUnique({
      where: { id: categoryId },
      select: {
        id: true,
        category_name: true,
        image: true,
      },
    });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    return res.json(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const createCategory = async (req: Request, res: Response) => {
  const { category_name, image } = req.body;

  try {
    const newCategory = await prisma.service_category.create({
      data: {
        category_name,
        image: image || "",
      },
    });

    return res.status(201).json({
      message: "Category created successfully",
      category: newCategory,
    });
  } catch (error) {
    console.error("Error creating category:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
const updateCategory = async (req: Request, res: Response) => {
  const categoryId = parseInt(req.params.categoryId);
  const { category_name, image } = req.body;

  try {
    const updatedCategory = await prisma.service_category.update({
      where: { id: categoryId },
      data: {
        category_name,
        image,
      },
    });

    return res.json({
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (error) {
    console.error("Error updating category:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteCategory = async (req: Request, res: Response) => {
  const categoryId = parseInt(req.params.categoryId);

  try {
    // Find services belonging to the category
    const servicesToDelete = await prisma.service.findMany({
      where: {
        service_category_id: categoryId,
      },
    });

    // Delete each service
    await Promise.all(
      servicesToDelete.map(async (service) => {
        await prisma.service.delete({
          where: {
            id: service.id,
          },
        });
      })
    );

    // Delete the category
    await prisma.service_category.delete({
      where: {
        id: categoryId,
      },
    });

    return res.status(204).send(); // No content, successful deletion
  } catch (error) {
    console.error("Error deleting category:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export default {
  deleteCategory,
  updateCategory,
  getCategoryList,
  getCategoryById,
  createCategory,
};
