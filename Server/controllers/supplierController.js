import asyncHandler from "express-async-handler";
import Supplier from "../Models/SupplierModel.js";
import ImportRecord from "../Models/ImportRecordModel.js";

// @desc    Create a new supplier
// @route   POST /api/suppliers
// @access  Private/Admin
const createSupplier = asyncHandler(async (req, res) => {
    const { name, address, phoneNumber, email, description } = req.body;

    const supplierExists = await Supplier.findOne({
        $or: [{ name }, { email }],
    });

    if (supplierExists) {
        res.status(400);
        if (supplierExists.name === name) {
            throw new Error("Supplier name already exists");
        }
        if (supplierExists.email === email && email) {
            // check if email is provided
            throw new Error("Supplier email already exists");
        }
    }

    const supplier = new Supplier({
        name,
        address,
        phoneNumber,
        email,
        description,
    });

    const createdSupplier = await supplier.save();
    res.status(201).json(createdSupplier);
});

// @desc    Get all suppliers
// @route   GET /api/suppliers
// @access  Private/Admin
const getAllSuppliers = asyncHandler(async (req, res) => {
    const suppliers = await Supplier.find({}).sort({ createdAt: -1 });
    res.json(suppliers);
});

// @desc    Get supplier by ID
// @route   GET /api/suppliers/:id
// @access  Private/Admin
const getSupplierById = asyncHandler(async (req, res) => {
    const supplier = await Supplier.findById(req.params.id);
    if (supplier) {
        res.json(supplier);
    } else {
        res.status(404);
        throw new Error("Supplier not found");
    }
});

// @desc    Update supplier
// @route   PUT /api/suppliers/:id
// @access  Private/Admin
const updateSupplier = asyncHandler(async (req, res) => {
    const supplier = await Supplier.findById(req.params.id);

    if (supplier) {
        supplier.name = req.body.name || supplier.name;
        supplier.address = req.body.address || supplier.address;
        supplier.phoneNumber = req.body.phoneNumber || supplier.phoneNumber;
        supplier.email = req.body.email || supplier.email;
        supplier.description = req.body.description || supplier.description;

        // Check for uniqueness if name or email are being changed
        if (req.body.name && req.body.name !== supplier.name) {
            const nameExists = await Supplier.findOne({ name: req.body.name });
            if (nameExists) {
                res.status(400);
                throw new Error("Supplier name already exists");
            }
        }
        if (req.body.email && req.body.email !== supplier.email) {
            const emailExists = await Supplier.findOne({
                email: req.body.email,
            });
            if (emailExists) {
                res.status(400);
                throw new Error("Supplier email already exists");
            }
        }

        const updatedSupplier = await supplier.save();
        res.json(updatedSupplier);
    } else {
        res.status(404);
        throw new Error("Supplier not found");
    }
});

// @desc    Delete supplier
// @route   DELETE /api/suppliers/:id
// @access  Private/Admin
const deleteSupplier = asyncHandler(async (req, res) => {
    const supplier = await Supplier.findById(req.params.id);
    if (supplier) {
        // Optional: Check if supplier is associated with any import records before deleting
        // const importRecords = await ImportRecord.find({ supplier: supplier._id });
        // if (importRecords.length > 0) {
        //     res.status(400);
        //     throw new Error("Cannot delete supplier. It is associated with existing import records.");
        // }
        await supplier.remove(); // or supplier.deleteOne() in newer mongoose
        res.json({ message: "Supplier removed" });
    } else {
        res.status(404);
        throw new Error("Supplier not found");
    }
});

// @desc    Get import history for a supplier
// @route   GET /api/suppliers/:id/import-history
// @access  Private/Admin
const getSupplierImportHistory = asyncHandler(async (req, res) => {
    const supplierId = req.params.id;

    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
        res.status(404);
        throw new Error("Supplier not found");
    }

    const importHistory = await ImportRecord.find({ supplier: supplierId })
        .populate("product", "name") // Populate product name
        .populate("user", "name email") // Populate user name and email
        .sort({ createdAt: -1 });

    res.json(importHistory);
});

export {
    createSupplier,
    getAllSuppliers,
    getSupplierById,
    updateSupplier,
    deleteSupplier,
    getSupplierImportHistory,
};
