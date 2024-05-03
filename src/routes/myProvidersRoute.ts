import express from "express";
import myProvidersController from "../controllers/myProvidersController";

import { authenticateJwt } from "../middleware/auth";
const router = express.Router();

// GET /api/my/provider
router.get("/", myProvidersController.getLoggedInProvider);

// GET /api/my/provider/ratings
router.get(
  "/ratings",
  authenticateJwt,
  myProvidersController.getProviderRatings
);

export default router;
