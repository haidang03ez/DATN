import asyncHandler from "express-async-handler";
import Promotion from "../Models/PromotionModel.js";
import Product from "../Models/ProductModel.js";
import Category from "../Models/CategoryModel.js";

// @desc    Create a new promotion
// @route   POST /api/promotions
// @access  Private/Admin
const createPromotion = asyncHandler(async (req, res) => {
    const {
        name,
        description,
        discountPercentage,
        startDate,
        endDate,
        isActive,
        targetType,
        targetCategories,
        targetProducts,
    } = req.body;

    const promotion = new Promotion({
        name,
        description,
        discountPercentage,
        startDate,
        endDate,
        isActive,
        targetType,
        targetCategories: targetType === "Category" ? targetCategories : [],
        targetProducts: targetType === "Product" ? targetProducts : [],
        user: req.user._id, // Assuming admin user is performing this
    });

    try {
        const createdPromotion = await promotion.save();
        res.status(201).json(createdPromotion);
    } catch (error) {
        res.status(400);
        throw new Error(error.message || "Invalid promotion data");
    }
});

// @desc    Get all promotions
// @route   GET /api/promotions
// @access  Private/Admin
const getAllPromotions = asyncHandler(async (req, res) => {
    const promotions = await Promotion.find({})
        .populate("targetCategories", "name")
        .populate("targetProducts", "name")
        .sort({ createdAt: -1 });
    res.json(promotions);
});

// @desc    Get single promotion by ID
// @route   GET /api/promotions/:id
// @access  Private/Admin
const getPromotionById = asyncHandler(async (req, res) => {
    const promotion = await Promotion.findById(req.params.id)
        .populate("targetCategories", "name")
        .populate("targetProducts", "name");

    if (promotion) {
        res.json(promotion);
    } else {
        res.status(404);
        throw new Error("Promotion not found");
    }
});

// @desc    Update a promotion
// @route   PUT /api/promotions/:id
// @access  Private/Admin
const updatePromotion = asyncHandler(async (req, res) => {
    const {
        name,
        description,
        discountPercentage,
        startDate,
        endDate,
        isActive,
        targetType,
        targetCategories,
        targetProducts,
    } = req.body;

    const promotion = await Promotion.findById(req.params.id);

    if (promotion) {
        promotion.name = name || promotion.name;
        promotion.description = description || promotion.description;
        promotion.discountPercentage =
            discountPercentage || promotion.discountPercentage;
        promotion.startDate = startDate || promotion.startDate;
        promotion.endDate = endDate || promotion.endDate;
        promotion.isActive =
            isActive === undefined ? promotion.isActive : isActive;
        promotion.targetType = targetType || promotion.targetType;

        if (targetType === "Category") {
            promotion.targetCategories =
                targetCategories || promotion.targetCategories;
            promotion.targetProducts = []; // Clear products if type is Category
        } else if (targetType === "Product") {
            promotion.targetProducts =
                targetProducts || promotion.targetProducts;
            promotion.targetCategories = []; // Clear categories if type is Product
        } else if (targetType === "All") {
            promotion.targetCategories = [];
            promotion.targetProducts = [];
        }

        try {
            const updatedPromotion = await promotion.save();
            res.json(updatedPromotion);
        } catch (error) {
            res.status(400);
            throw new Error(error.message || "Invalid promotion data");
        }
    } else {
        res.status(404);
        throw new Error("Promotion not found");
    }
});

// @desc    Delete a promotion
// @route   DELETE /api/promotions/:id
// @access  Private/Admin
const deletePromotion = asyncHandler(async (req, res) => {
    const promotion = await Promotion.findById(req.params.id);

    if (promotion) {
        // Optional: Remove references from products/categories if needed
        // This can be complex, consider if it's a strict requirement or if promotions
        // can just become "inactive" or "expired".
        // For now, we'll just delete the promotion document.

        await promotion.remove();
        res.json({ message: "Promotion removed" });
    } else {
        res.status(404);
        throw new Error("Promotion not found");
    }
});

// @desc    Get active promotions applicable for a product (for client-side)
// @route   GET /api/promotions/applicable/:productId
// @access  Public
const getApplicablePromotionsForProduct = asyncHandler(async (req, res) => {
    const productId = req.params.productId;
    const product = await Product.findById(productId).populate("category");

    if (!product) {
        res.status(404);
        throw new Error("Product not found");
    }

    const now = new Date();

    // Find promotions:
    // 1. Specifically for this product
    // 2. For the category of this product
    // 3. "All" products promotions
    const promotions = await Promotion.find({
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
        $or: [
            { targetType: "Product", targetProducts: productId },
            { targetType: "Category", targetCategories: product.category }, // Assuming product.category stores ObjectId
            { targetType: "All" },
        ],
    }).sort({ discountPercentage: -1 }); // Higher discount first, or by some priority

    // Logic to select the best promotion (e.g., highest discount)
    // For now, returning all applicable ones, client can decide or we can refine this.
    // Typically, you'd apply one "best" promotion.
    // Example: Product specific > Category specific > All. If multiple of same type, highest discount.

    // Simplified: pick the one with highest discount if multiple found
    let bestPromotion = null;
    if (promotions.length > 0) {
        // Prioritize: Product > Category > All
        const productSpecific = promotions.find(
            (p) =>
                p.targetType === "Product" &&
                p.targetProducts.includes(productId)
        );
        const categorySpecific = promotions.find(
            (p) =>
                p.targetType === "Category" &&
                p.targetCategories.includes(product.category)
        );
        const allSpecific = promotions.find((p) => p.targetType === "All");

        if (productSpecific) bestPromotion = productSpecific;
        else if (categorySpecific) bestPromotion = categorySpecific;
        else if (allSpecific) bestPromotion = allSpecific;
    }

    res.json(bestPromotion ? [bestPromotion] : []); // Return as array for consistency
});

export {
    createPromotion,
    getAllPromotions,
    getPromotionById,
    updatePromotion,
    deletePromotion,
    getApplicablePromotionsForProduct,
};
