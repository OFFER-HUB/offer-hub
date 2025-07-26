import { Router } from "express";
import { reviewController } from "../controllers/review.controller";

const router = Router();

router.post("/", reviewController.createReview);

router.get("user/:id/reviews", reviewController.getReviewsByUser);

export { router as reviewRoutes };
