// CategoriesRoute.ts
import express from "express";
import CategoriesController from "../controllers/CategoriesController";

const router = express.Router();

// GET /api/public/category/list
router.get("/list", CategoriesController.getCategoryList);

// GET /api/public/category/:categoryId
router.get("/:categoryId", CategoriesController.getCategoryById);

export default router;
