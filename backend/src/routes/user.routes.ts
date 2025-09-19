import { Router } from "express";
import {
  createUserHandler,
  getUserByIdHandler,
  updateUserHandler,
  getAllUsersHandler,
} from "@/controllers/user.controller";
import { authorizeRoles, verifyToken } from "@/middlewares/auth.middleware";
import { UserRole } from "@/types/auth.types";

const router = Router();

router.get("/", verifyToken, authorizeRoles(UserRole.ADMIN), getAllUsersHandler);

// I added authorization here because the route for public registration is in /api/auth/register
router.post("/", verifyToken, authorizeRoles(UserRole.ADMIN), createUserHandler);

router.get("/:id", verifyToken, getUserByIdHandler);
router.patch("/:id", verifyToken, updateUserHandler);

export default router;
