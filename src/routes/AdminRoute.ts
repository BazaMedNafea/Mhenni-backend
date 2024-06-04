import express from "express";
import {
  listCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  signIn,
  getLoggedInAdminId,
  getAdminImage,
  getAdminEmail,
  listProviders,
  getProvider,
  updateProvider,
  deleteProvider,
  listCustomers,
  listServices,
  addService,
  updateService,
  deleteService,
  deleteCustomer,
  updateCustomer,
  getCustomerById,
} from "../controllers/AdminController";

const router = express.Router();

// Authentication routes
router.post("/login", signIn); // POST /api/my/admin/auth/login
router.get("/logged-in-admin-id", getLoggedInAdminId); // GET /api/my/admin/logged-in-admin-id
router.get("/:adminId/image", getAdminImage); // GET /api/my/admin/:adminId/image
router.get("/:adminId/email", getAdminEmail); // GET /api/my/admin/:adminId/email

// Category routes
router.get("/category/list", listCategories); // GET /api/admin/category/list
router.post("/category", addCategory); // POST /api/admin/category
router.put("/category/:id", updateCategory); // PUT /api/admin/category/:id
router.delete("/category/:id", deleteCategory); // DELETE /api/admin/category/:id

// Provider routes
router.get("/provider/list", listProviders); // GET /api/admin/provider/list
router.get("/provider/:id", getProvider); // GET /api/admin/provider/:id
router.put("/provider/:id", updateProvider); // PUT /api/admin/provider/:id
router.delete("/provider/:id", deleteProvider); // DELETE /api/admin/provider/:id

// Customer routes
router.get("/customer/list", listCustomers); // GET /api/admin/customer/list
router.get("/customer/:id", getCustomerById); // GET /api/admin/provider/:id
router.put("/customer/:id", updateCustomer); // PUT /api/admin/provider/:id
router.delete("/customer/:id", deleteCustomer); // DELETE /api/admin/provider/:id

// Service routes
router.get("/service/list", listServices); // GET /api/admin/service/list
router.post("/service", addService); // POST /api/admin/service
router.put("/service/:id", updateService); // PUT /api/admin/service/:id
router.delete("/service/:id", deleteService); // DELETE /api/admin/service/:id

export default router;
