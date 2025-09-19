import { Router } from "express";
import {
  createProjectHandler,
  getAllProjectsHandler,
  getProjectByIdHandler,
  updateProjectHandler,
  deleteProjectHandler,
} from "@/controllers/project.controller";
import { authorizeRoles, verifyToken } from "@/middlewares/auth.middleware";
import { UserRole } from "@/types/auth.types";

const router = Router();

router.post(
  "/",
  verifyToken,
  authorizeRoles(UserRole.CLIENT, UserRole.ADMIN),
  createProjectHandler
);

router.get("/", getAllProjectsHandler);

router.get("/:id", getProjectByIdHandler);

router.patch(
  "/:id",
  verifyToken,
  authorizeRoles(UserRole.CLIENT, UserRole.ADMIN),
  updateProjectHandler
);

router.delete(
  "/:id",
  verifyToken,
  authorizeRoles(UserRole.CLIENT, UserRole.ADMIN),
  deleteProjectHandler
);

export default router;
