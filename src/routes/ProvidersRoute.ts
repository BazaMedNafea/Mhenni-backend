import express from "express";
import ProvidersController from "../controllers/ProvidersController";

const router = express.Router();

// GET /api/provider/list
router.get("/list", ProvidersController.getProvidersList);
// GET /api/provider/:providerId
router.get("/:providerId", ProvidersController.getProviderById);
// POST /api/my/provider
router.post("/", ProvidersController.createProvider);
// PUT /api/provider/providerId
router.put("/:providerId", ProvidersController.updateProvider);
// DELETE /api/provider/:providerId
router.delete("/:providerId", ProvidersController.deleteProvider);
// GET /api/provider/ratings/:providerId
router.get("/ratings/:providerId", ProvidersController.getProviderRatings);

export default router;
