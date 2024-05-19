// MyProviderRoute.ts
import express from "express";
import MyProviderController from "../controllers/MyProviderController";
import { jwtCheck, jwtParse } from "../middleware/auth"; // Import your jwtParse middleware

const router = express.Router();

// Route to add a service for a provider
router.post(
  "/add-service",
  jwtCheck,
  jwtParse,
  MyProviderController.addServiceForProvider
);

router.get(
  "/request",
  jwtCheck,
  jwtParse,
  MyProviderController.getProviderRequests
);

export default router;
