import express from "express";
import MyCustomerController from "../controllers/MyCustomerController";
import { jwtCheck, jwtParse } from "../middleware/auth";

const router = express.Router();

// /api/my/customer/add-request
router.post(
  "/add-request",
  jwtCheck,
  jwtParse,
  MyCustomerController.addServiceRequest
);

// /api/my/customer/orders/list
router.get(
  "/orders/list",
  jwtCheck,
  jwtParse,
  MyCustomerController.getMyOrders
);

// /api/my/customer/orders/:orderId
router.get(
  "/orders/:orderId",
  jwtCheck,
  jwtParse,
  MyCustomerController.getOrderById
);

router.get(
  "/requests",
  jwtCheck,
  jwtParse,
  MyCustomerController.getMyCustomerRequests
);

router.get(
  "/requests/:id",
  jwtCheck,
  jwtParse,
  MyCustomerController.getMyCustomerRequestById
);

router.patch(
  "/requests/:requestId/update-status",
  jwtCheck,
  jwtParse,
  MyCustomerController.updateRequestStatus
);

// New endpoint for confirming request completion
router.post(
  "/requests/:requestId/complete",
  jwtCheck,
  jwtParse,
  MyCustomerController.confirmRequestCompletion
);

router.post(
  "/requests/:requestId/reviews/add",
  jwtCheck,
  jwtParse,
  MyCustomerController.addReview
);

export default router;
