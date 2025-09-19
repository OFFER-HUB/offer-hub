import { Router } from "express";
import {
  createApplicationHandler,
  getApplicationsByProjectHandler,
  updateApplicationStatusHandler,
} from "@/controllers/application.controller";
import { authorizeRoles, verifyToken } from "@/middlewares/auth.middleware";
import { UserRole } from "@/types/auth.types";

const router = Router();

router.post(
  "/",
  verifyToken,
  authorizeRoles(UserRole.FREELANCER),
  createApplicationHandler
);

router.get(
  "/project/:id",
  verifyToken,
  authorizeRoles(UserRole.CLIENT, UserRole.ADMIN),
  getApplicationsByProjectHandler
);

router.patch(
  "/:id",
  verifyToken,
  authorizeRoles(UserRole.CLIENT, UserRole.ADMIN),
  updateApplicationStatusHandler
);

export default router;
