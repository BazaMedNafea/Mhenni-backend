import express from "express";
import ServicesController from "../controllers/ServicesController";

const router = express.Router();

// GET /api/service/list
router.get("/list", ServicesController.getServiceListWithCategories);

// GET /api/service/list/:providerId
router.get("/list/:providerId", ServicesController.getServicesByProviderId);

// GET /api/service/:serviceId
router.get("/:serviceId", ServicesController.getServiceById);

export default router;
