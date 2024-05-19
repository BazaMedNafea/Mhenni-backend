// ServicesRoute.ts
import express from "express";
import ServicesController from "../controllers/ServicesController";

const router = express.Router();

// GET /api/public/service/list
router.get("/list", ServicesController.getServiceProviderMapList);

// // GET /api/public/service/:serviceId
// router.get("/:serviceId", ServicesController.getServiceById);

// GET /api/public/service/category/:categoryId
router.get("/category/:categoryId", ServicesController.getServicesByCategory);

export default router;
