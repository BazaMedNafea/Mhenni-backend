import express from "express";
import MyOrdersController from "../controllers/MyOrdersController";
import { jwtCheck, jwtParse } from "../middleware/auth";

const router = express.Router();

// /api/my/orders/list
router.get("/list", jwtCheck, jwtParse, MyOrdersController.getMyOrders);

// /api/my/orders/:orderId
router.get("/:orderId", jwtCheck, jwtParse, MyOrdersController.getOrderById);

export default router;
