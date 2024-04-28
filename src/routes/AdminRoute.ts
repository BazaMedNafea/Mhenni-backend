import express from "express";
import AdminController from "../controllers/AdminController";

const router = express.Router();

// /api/admin/auth/register
router.post("/register", AdminController.registerAdmin);

// /api/admin/auth/login
router.post("/login", AdminController.loginAdmin);

// GET admin image
router.get("/:adminId/image", AdminController.getAdminImage);

// GET logged-in admin ID
router.get("/logged-in-admin-id", AdminController.getLoggedInAdminId);

// GET admin ID by email
router.get("/:email/id", AdminController.getAdminIdByEmail);

// Add a new route to fetch admin's email by admin ID
router.get("/:adminId/email", AdminController.getAdminEmailById);

export default router;
