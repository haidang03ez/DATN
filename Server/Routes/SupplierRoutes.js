import express from "express";
import {
    createSupplier,
    getAllSuppliers,
    getSupplierById,
    updateSupplier,
    deleteSupplier,
    getSupplierImportHistory,
} from "../controllers/supplierController.js";
import {
    admin,
    protect,
    protectInventoryManager,
} from "../Middleware/AuthMiddleware.js";

const router = express.Router();

// Routes for suppliers - accessible by admin and inventoryManager
router
    .route("/")
    .post(protect, protectInventoryManager, createSupplier)
    .get(protect, protectInventoryManager, getAllSuppliers);

router
    .route("/:id")
    .get(protect, protectInventoryManager, getSupplierById)
    .put(protect, protectInventoryManager, updateSupplier)
    .delete(protect, protectInventoryManager, deleteSupplier);

// Route to get import history for a specific supplier - accessible by admin and inventoryManager
router
    .route("/:id/import-history")
    .get(protect, protectInventoryManager, getSupplierImportHistory);

export default router;
