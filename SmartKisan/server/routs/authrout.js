// routes/authRout.js
import express from "express";
import {
  register,
  verifyotp,
  login,
  logout,
  getuser
} from "../controllers/authcontroller.js";
import { authenticate } from "../middlewares/authmiddleware.js";

const router = express.Router();

// Auth routes
router.post("/register", register);
router.post("/verifyotp", verifyotp);
router.post("/login", login);
router.get("/logout", authenticate, logout);
router.get("/me", authenticate, getuser);

export default router;
