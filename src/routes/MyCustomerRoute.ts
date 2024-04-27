import express from "express";
import MyCustomerController from "../controllers/MyCustomerController";
import { jwtCheck, jwtParse } from "../middleware/auth";
import { validateMyCustomerRequest } from "../middleware/validation";

const router = express.Router();

// /api/my/user
router.get("/", jwtCheck, jwtParse, MyCustomerController.getCurrentCustomer);
router.post("/", jwtCheck, MyCustomerController.createCurrentCustomer);
router.put(
  "/",

  validateMyCustomerRequest,
  MyCustomerController.updateCurrentCustomer
);

export default router;
