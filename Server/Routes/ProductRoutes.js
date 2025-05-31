import express from "express";
import asyncHandler from "express-async-handler";
import Product from "../Models/ProductModel.js";
import Promotion from "../Models/PromotionModel.js";
import {
    admin,
    protect,
    protectInventoryManager,
} from "./../Middleware/AuthMiddleware.js";
import ImportRecord from "../Models/ImportRecordModel.js";
import Supplier from "../Models/SupplierModel.js";

const productRouter = express.Router();

// Helper function to apply promotion and calculate average import price
const applyPromotionToProduct = async (product) => {
    if (!product) return product;

    const now = new Date();
    let productObject = product.toObject ? product.toObject() : { ...product };

    // Calculate Average Import Price
    const importRecords = await ImportRecord.find({ product: product._id });
    if (importRecords.length > 0) {
        const totalQuantity = importRecords.reduce(
            (acc, record) => acc + record.quantity,
            0
        );
        const totalCost = importRecords.reduce(
            (acc, record) => acc + record.importPrice * record.quantity,
            0
        );
        if (totalQuantity > 0) {
            productObject.averageImportPrice = parseFloat(
                (totalCost / totalQuantity).toFixed(2)
            );
        } else {
            productObject.averageImportPrice = 0;
        }
    } else {
        productObject.averageImportPrice = 0;
    }

    // Lấy ID của category một cách an toàn
    const categoryId =
        product.category && product.category._id
            ? product.category._id
            : product.category;

    // Find applicable promotions
    const promotions = await Promotion.find({
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
        $or: [
            { targetType: "Product", targetProducts: product._id },
            { targetType: "Category", targetCategories: categoryId }, // Sử dụng categoryId
            { targetType: "All" },
        ],
    }).sort({ discountPercentage: -1 }); // Higher discount first

    let bestPromotion = null;
    if (promotions.length > 0) {
        const productSpecific = promotions.find(
            (p) =>
                p.targetType === "Product" &&
                p.targetProducts.some((tp) => tp.equals(product._id))
        );
        const categorySpecific = promotions.find(
            (p) =>
                p.targetType === "Category" &&
                // Đảm bảo categoryId tồn tại trước khi dùng some
                categoryId &&
                p.targetCategories.some((tc) => tc.equals(categoryId))
        );
        const allSpecific = promotions.find((p) => p.targetType === "All");

        if (productSpecific) bestPromotion = productSpecific;
        else if (categorySpecific) bestPromotion = categorySpecific;
        else if (allSpecific) bestPromotion = allSpecific;
    }

    if (bestPromotion) {
        productObject.originalPrice = productObject.price;
        productObject.discountPercentage = bestPromotion.discountPercentage;
        productObject.discountedPrice = parseFloat(
            (
                productObject.price *
                (1 - bestPromotion.discountPercentage / 100)
            ).toFixed(2)
        );
        productObject.appliedPromotion = {
            _id: bestPromotion._id,
            name: bestPromotion.name,
            discountPercentage: bestPromotion.discountPercentage,
        };
    } else {
        productObject.discountedPrice = productObject.price;
    }
    return productObject;
};

// Get all product (for customer view - with promotions)
productRouter.get(
    "/",
    asyncHandler(async (req, res) => {
        const products = await Product.find({})
            .populate("category", "name")
            .sort({ _id: -1 });
        const productsWithPromotions = await Promise.all(
            products.map(
                async (product) => await applyPromotionToProduct(product)
            )
        );
        res.json(productsWithPromotions);
    })
);

// Admin get all (raw data, no need for promotion calculation here, or could be optional)
productRouter.get(
    "/all",
    protect,
    admin,
    asyncHandler(async (req, res) => {
        const products = await Product.find({})
            .populate("category", "name")
            .sort({ _id: -1 });
        res.json(products); // Sending raw products for now for admin
    })
);

// Get single product (for customer/admin view - with promotions)
productRouter.get(
    "/:id",
    asyncHandler(async (req, res) => {
        const product = await Product.findById(req.params.id).populate(
            "category",
            "name"
        );
        if (product) {
            const productWithPromotion = await applyPromotionToProduct(product);
            res.json(productWithPromotion);
        } else {
            res.status(404);
            throw new Error("Không tìm thấy sản phẩm này!");
        }
    })
);

// Product review
productRouter.post(
    "/:id/review",
    protect,
    asyncHandler(async (req, res) => {
        const { rating, comment } = req.body;
        const product = await Product.findById(req.params.id);

        if (product) {
            const alreadyReviewed = product.reviews.find(
                (r) => r.user.toString() === req.user._id.toString()
            );
            if (alreadyReviewed) {
                res.status(400);
                throw new Error("Bạn đã đánh giá sản phẩm này rồi!");
            }
            const review = {
                name: req.user.name,
                rating: Number(rating),
                comment,
                user: req.user._id,
            };

            product.reviews.push(review);
            product.numReviews = product.reviews.length;
            product.rating =
                product.reviews.reduce((acc, item) => item.rating + acc, 0) /
                product.reviews.length;
            await product.save();
            res.status(201).json({ message: "Đánh giá đã được thêm!" });
        } else {
            res.status(404);
            throw new Error("Không tìm thấy sản phẩm này!");
        }
    })
);

// Delete product
productRouter.delete(
    "/:id",
    protect,
    admin,
    asyncHandler(async (req, res) => {
        const product = await Product.findById(req.params.id);
        if (product) {
            await product.remove();
            res.json({ message: "Xóa sản phẩm thành công!" });
        } else {
            res.status(404);
            throw new Error("Không tìm thấy sản phẩm này!");
        }
    })
);

// Create product
productRouter.post(
    "/",
    protect,
    admin,
    asyncHandler(async (req, res) => {
        const {
            name,
            price,
            countInStock,
            description,
            category,
            image,
            author,
        } = req.body;

        const productExists = await Product.findOne({ name });

        if (productExists) {
            res.status(400);
            throw new Error("Product name already exists");
        } else {
            const product = new Product({
                name,
                price,
                countInStock,
                description,
                category,
                image,
                author,
                user: req.user._id,
            });

            if (product) {
                const createProduct = await product.save();
                res.status(201).json(createProduct);
            } else {
                res.status(400);
                throw new Error("Invalid product data");
            }
        }
    })
);

// Update product
productRouter.put(
    "/:id",
    protect,
    admin,
    asyncHandler(async (req, res) => {
        const {
            name,
            price,
            countInStock,
            description,
            category,
            image,
            author,
        } = req.body;
        const product = await Product.findById(req.params.id);

        if (product) {
            product.name = name || product.name;
            product.price = price || product.price;
            product.countInStock =
                countInStock === undefined
                    ? product.countInStock
                    : countInStock;
            product.description = description || product.description;
            product.category = category || product.category;
            product.image = image || product.image;
            product.author = author || product.author;

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404);
            throw new Error("Không tìm thấy sản phẩm này!");
        }
    })
);

// Thống kê số lượng hàng trong kho
productRouter.get(
    "/inventory/stats",
    protect,
    protectInventoryManager,
    asyncHandler(async (req, res) => {
        const products = await Product.find({});
        // console.log(
        //     "All products:",
        //     products.map((p) => ({ name: p.name, stock: p.countInStock }))
        // );

        const stats = {
            totalProducts: products.length,
            totalItems: products.reduce(
                (acc, product) => acc + (product.countInStock || 0),
                0
            ),
            lowStock: products.filter((product) => {
                const stock = product.countInStock || 0;
                return stock > 0 && stock < 10;
            }).length,
            outOfStock: products.filter(
                (product) => (product.countInStock || 0) === 0
            ).length,
            products: products.map((product) => ({
                name: product.name,
                countInStock: product.countInStock || 0,
                price: product.price,
            })),
        };

        // console.log("Calculated stats:", stats);
        res.json(stats);
    })
);

// Xuất hóa đơn nhập hàng
productRouter.post(
    "/inventory/import",
    protect,
    admin,
    asyncHandler(async (req, res) => {
        const { productId, quantity, importPrice } = req.body;

        console.log("Received data:", req.body);

        // Kiểm tra dữ liệu đầu vào
        if (!productId || !quantity || !importPrice) {
            res.status(400);
            throw new Error("Vui lòng nhập đầy đủ thông tin");
        }

        // Chuyển đổi và kiểm tra dữ liệu số
        const newQuantity = parseInt(quantity);
        const newImportPrice = parseInt(importPrice);

        if (isNaN(newQuantity) || isNaN(newImportPrice)) {
            res.status(400);
            throw new Error("Số lượng và giá phải là số");
        }

        if (newQuantity <= 0) {
            res.status(400);
            throw new Error("Số lượng phải lớn hơn 0");
        }

        if (newImportPrice < 0) {
            res.status(400);
            throw new Error("Giá nhập không được âm");
        }

        // Tìm sản phẩm
        const product = await Product.findById(productId);
        console.log("Found product:", product);

        if (!product) {
            res.status(404);
            throw new Error("Không tìm thấy sản phẩm");
        }

        // Cập nhật số lượng trong kho
        product.countInStock = (product.countInStock || 0) + newQuantity;
        await product.save();

        console.log("Updated product stock:", product.countInStock);

        // Tạo bản ghi nhập hàng
        const importRecord = new ImportRecord({
            product: productId,
            quantity: newQuantity,
            importPrice: newImportPrice,
            user: req.user._id,
        });
        await importRecord.save();

        console.log("Created import record:", importRecord);

        res.status(201).json({
            message: "Nhập hàng thành công",
            product: {
                _id: product._id,
                name: product.name,
                countInStock: product.countInStock,
            },
            importRecord: {
                _id: importRecord._id,
                quantity: importRecord.quantity,
                importPrice: importRecord.importPrice,
                createdAt: importRecord.createdAt,
            },
        });
    })
);

// Xuất hóa đơn thống kê
productRouter.get(
    "/inventory/report",
    protect,
    protectInventoryManager,
    asyncHandler(async (req, res) => {
        const { startDate, endDate } = req.query;
        const query = {};

        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        }

        const importRecords = await ImportRecord.find(query)
            .populate("product", "name price")
            .populate("user", "name email")
            .populate("supplier", "name");

        const report = {
            totalImports: importRecords.length,
            totalQuantity: importRecords.reduce(
                (acc, record) => acc + record.quantity,
                0
            ),
            totalCost: importRecords.reduce(
                (acc, record) => acc + record.quantity * record.importPrice,
                0
            ),
            records: importRecords,
        };

        res.json(report);
    })
);

// IMPORT PRODUCT STOCK (CREATE IMPORT RECORD)
productRouter.post(
    "/:id/import",
    protect,
    protectInventoryManager,
    asyncHandler(async (req, res) => {
        const { quantity, importPrice, supplierId, importDate } = req.body;
        const productId = req.params.id;

        if (!supplierId) {
            res.status(400);
            throw new Error("Supplier ID is required for import record");
        }

        const supplier = await Supplier.findById(supplierId);
        if (!supplier) {
            res.status(404);
            throw new Error("Supplier not found");
        }

        const product = await Product.findById(productId);

        if (product) {
            const newImportRecord = new ImportRecord({
                product: productId,
                supplier: supplierId,
                quantity: Number(quantity),
                importPrice: Number(importPrice),
                user: req.user._id,
            });

            await newImportRecord.save();

            product.countInStock =
                (product.countInStock || 0) + Number(quantity);
            await product.save();

            res.status(201).json({
                message: "Stock imported successfully",
                importRecord: newImportRecord,
            });
        } else {
            res.status(404);
            throw new Error("Product not found!");
        }
    })
);

// GET IMPORT HISTORY FOR A PRODUCT
productRouter.get(
    "/:id/import-history",
    protect,
    admin,
    asyncHandler(async (req, res) => {
        const productId = req.params.id;
        const importHistory = await ImportRecord.find({ product: productId })
            .populate("user", "name email")
            .populate("supplier", "name")
            .sort({ createdAt: -1 });

        if (importHistory) {
            res.json(importHistory);
        } else {
            res.status(404);
            throw new Error(
                "No import history found for this product or product does not exist."
            );
        }
    })
);

// ADMIN GET IMPORT RECORDS FOR A PRODUCT
productRouter.get(
    "/:id/import-records",
    protect,
    protectInventoryManager,
    asyncHandler(async (req, res) => {
        const product = await Product.findById(req.params.id);
        if (!product) {
            res.status(404);
            throw new Error("Product not found!");
        }
        res.json(product);
    })
);

// ADMIN CREATE IMPORT RECORD FOR A PRODUCT
productRouter.post(
    "/:id/import-records",
    protect,
    protectInventoryManager,
    asyncHandler(async (req, res) => {
        const { supplierId, quantity, importPrice } = req.body;
        const productId = req.params.id;

        if (!supplierId) {
            res.status(400);
            throw new Error("Supplier ID is required for import record");
        }

        const supplier = await Supplier.findById(supplierId);
        if (!supplier) {
            res.status(404);
            throw new Error("Supplier not found");
        }

        const product = await Product.findById(productId);

        if (product) {
            const newImportRecord = new ImportRecord({
                product: productId,
                supplier: supplierId,
                quantity: Number(quantity),
                importPrice: Number(importPrice),
                user: req.user._id,
            });

            await newImportRecord.save();

            product.countInStock =
                (product.countInStock || 0) + Number(quantity);
            await product.save();

            res.status(201).json({
                message: "Stock imported successfully",
                importRecord: newImportRecord,
            });
        } else {
            res.status(404);
            throw new Error("Product not found!");
        }
    })
);

export default productRouter;
