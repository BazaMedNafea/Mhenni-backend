import express from "express";
import CategoriesController from "../controllers/CategoriesController";

const router = express.Router();

// GET /api/category/list
router.get("/list", CategoriesController.getCategoryList);
// GET /api/category/:categoryId
router.get("/:categoryId", CategoriesController.getCategoryById);
// POST /api/category
router.post("/", CategoriesController.createCategory);
// PUT /api/category/:categoryId
router.put("/:categoryId", CategoriesController.updateCategory);
// DELETE /api/category/:categoryId
router.delete("/:categoryId", CategoriesController.deleteCategory);

export default router;
