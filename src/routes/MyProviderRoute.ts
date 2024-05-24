// MyProviderRoute.ts
import express from "express";
import MyProviderController from "../controllers/MyProviderController";
import { jwtCheck, jwtParse } from "../middleware/auth";

const router = express.Router();

// Route to add a service for a provider
router.post(
  "/add-service",
  jwtCheck,
  jwtParse,
  MyProviderController.addServiceForProvider
);

// Route to get provider requests
router.get(
  "/request",
  jwtCheck,
  jwtParse,
  MyProviderController.getProviderRequests
);

// Route to get provider services
router.get(
  "/services",
  jwtCheck,
  jwtParse,
  MyProviderController.getProviderServices
);

// Route to update a provider service
router.put(
  "/services/:id",
  jwtCheck,
  jwtParse,
  MyProviderController.updateProviderService
);

// Route to delete a provider service
router.delete(
  "/services/:id",
  jwtCheck,
  jwtParse,
  MyProviderController.deleteProviderService
);

router.post(
  "/request/:requestId/offer",
  jwtCheck,
  jwtParse,
  MyProviderController.createProviderOffer
);
export default router;
