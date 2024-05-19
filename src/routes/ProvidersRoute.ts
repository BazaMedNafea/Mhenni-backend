// ProvidersRoute.ts
import express from "express";
import ProvidersController from "../controllers/ProvidersController";

const router = express.Router();

// Existing route to get providers by service ID
router.get("/service/:serviceId", ProvidersController.getProvidersByService);

// New route to get provider by ID
router.get("/:providerId", ProvidersController.getProviderById);

router.get("/:providerId/offers", ProvidersController.getOffersByProviderId);
export default router;
