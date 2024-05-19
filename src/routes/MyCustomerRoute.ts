import express from "express";
import MyCustomerController from "../controllers/MyCustomerController";
import { jwtCheck, jwtParse } from "../middleware/auth";

const router = express.Router();

// /api/my/customer
router.post(
  "/add-request",
  jwtCheck,
  jwtParse,
  MyCustomerController.addServiceRequest
);

export default router;
