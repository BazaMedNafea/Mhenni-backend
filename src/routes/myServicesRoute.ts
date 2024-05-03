import express from "express";
import MyServicesController from "../controllers/myServicesController";
import ServicesController from "../controllers/ServicesController";

const router = express.Router();

// GET /api/my/service/list
router.get("/list", MyServicesController.getServiceList);
// GET /api/my/service/:serviceId
router.get("/:serviceId", MyServicesController.getMyServiceById);
// POST /api/my/service
router.post("/", MyServicesController.createMyService);
// PUT /api/service/:serviceId
router.put("/:serviceId", ServicesController.updateService);
// PUT /api/my/service/:serviceId
router.put("/:serviceId", MyServicesController.updateMyService);
// DELETE /api/my/service/:serviceId
router.delete("/:serviceId", MyServicesController.deleteMyService);
// GET /api/service/category
router.get("/category", ServicesController.searchServicesByCategory);

export default router;
