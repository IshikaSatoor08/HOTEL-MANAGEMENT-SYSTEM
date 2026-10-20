
import express from "express";
import {
  registerUser,
  loginUser,
} from "../controllers/authController.js";

const router = express.Router();

// Register a new customer
router.post("/register", registerUser);

// Log in an existing customer
router.post("/login", loginUser);

export default router;
