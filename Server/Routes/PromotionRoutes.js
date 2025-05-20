import express from "express";
import {
    createPromotion,
    getAllPromotions,
    getPromotionById,
    updatePromotion,
    deletePromotion,
    getApplicablePromotionsForProduct,
} from "../controllers/promotionController.js";
import { protect, admin } from "../Middleware/AuthMiddleware.js";

const router = express.Router();

// PUBLIC ROUTES
router.get("/applicable/:productId", getApplicablePromotionsForProduct);

// ADMIN ROUTES
router
    .route("/")
    .post(protect, admin, createPromotion)
    .get(protect, admin, getAllPromotions);

router
    .route("/:id")
    .get(protect, admin, getPromotionById)
    .put(protect, admin, updatePromotion)
    .delete(protect, admin, deletePromotion);

export default router;
