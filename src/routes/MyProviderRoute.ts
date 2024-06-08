import express from "express";
import MyProviderController from "../controllers/MyProviderController";
import { jwtCheck, jwtParse } from "../middleware/auth";
import multer from "multer";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

router.post(
  "/add-service",
  jwtCheck,
  jwtParse,
  upload.single("serviceImage"), // Add this line
  MyProviderController.addServiceForProvider
);

// Route to get provider requests
router.get(
  "/requests",
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

// Route to create a provider offer for a request
router.post(
  "/requests/:requestId/offer",
  jwtCheck,
  jwtParse,
  MyProviderController.createProviderOffer
);

// Route to confirm request completion
router.post(
  "/requests/:requestId/complete",
  jwtCheck,
  jwtParse,
  MyProviderController.confirmRequestCompletion
);

export default router;
