import express from "express";
import asyncHandler from "express-async-handler";
import { admin, protect } from "../Middleware/AuthMiddleware.js";
import Order from "./../Models/OrderModel.js";
import Product from "./../Models/ProductModel.js";
import Category from "./../Models/CategoryModel.js";
import mongoose from "mongoose";

const orderRouter = express.Router();

// Create order
orderRouter.post(
    "/",
    protect,
    asyncHandler(async (req, res) => {
        const {
            orderItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
        } = req.body;

        if (orderItems && orderItems.length === 0) {
            res.status(400);
            throw new Error("No order items");
        } else {
            // Get all categories for discount calculation
            const categories = await Category.find({});

            // Process each order item
            for (const item of orderItems) {
                const product = await Product.findById(item.product);
                if (product) {
                    if (product.countInStock < item.qty) {
                        res.status(400);
                        throw new Error(
                            `Sản phẩm ${product.name} không đủ số lượng trong kho`
                        );
                    }

                    // Apply Promotion logic to get discountedPrice and discount percentage for the item
                    const promotion = product.promotion
                        ? await mongoose
                              .model("Promotion")
                              .findById(product.promotion)
                        : null;
                    let finalDiscountPercentage = product.discount || 0; // Default to product's own discount
                    let appliedPromotion = null;

                    if (promotion && promotion.isActive) {
                        const now = new Date();
                        if (
                            promotion.startDate <= now &&
                            promotion.endDate >= now
                        ) {
                            // Check if promotion applies to this product
                            let applies = false;
                            if (promotion.targetType === "All") {
                                applies = true;
                            } else if (
                                promotion.targetType === "Category" &&
                                product.category &&
                                promotion.targetCategories.some((catId) =>
                                    catId.equals(product.category)
                                )
                            ) {
                                applies = true;
                            } else if (
                                promotion.targetType === "Product" &&
                                promotion.targetProducts.some((prodId) =>
                                    prodId.equals(product._id)
                                )
                            ) {
                                applies = true;
                            }

                            if (applies) {
                                // If promotion discount is better, use it
                                if (
                                    promotion.discountPercentage >
                                    finalDiscountPercentage
                                ) {
                                    finalDiscountPercentage =
                                        promotion.discountPercentage;
                                    appliedPromotion = promotion.name; // Store promotion name if you want
                                }
                            }
                        }
                    }

                    item.discount = finalDiscountPercentage; // Lưu phần trăm giảm giá cuối cùng
                    item.discountedPrice = Math.round(
                        item.price * (1 - finalDiscountPercentage / 100)
                    );

                    product.countInStock -= item.qty;
                    product.sold += item.qty; // Thêm số lượng đã bán cho sản phẩm
                    await product.save();
                }
            }

            const initialStatus = paymentMethod === "COD" ? "pending" : "paid"; // Nếu COD thì pending, ngược lại là paid

            const order = new Order({
                orderItems,
                user: req.user._id,
                shippingAddress,
                paymentMethod,
                itemsPrice,
                taxPrice,
                shippingPrice,
                totalPrice,
                isPaid: paymentMethod !== "COD", // isPaid là true nếu không phải COD
                paidAt: paymentMethod !== "COD" ? Date.now() : null,
                status: initialStatus, // Sử dụng initialStatus
                orderStatusHistory: [
                    {
                        status: initialStatus,
                        updatedAt: Date.now(),
                        updatedBy: req.user._id,
                        notes: "Đơn hàng được tạo",
                    },
                ],
            });

            const createOrder = await order.save();
            res.status(201).json(createOrder);
        }
    })
);

// Admin get all orders
orderRouter.get(
    "/all",
    protect,
    admin,
    asyncHandler(async (req, res) => {
        const orders = await Order.find({})
            .sort({
                _id: -1,
            })
            .populate("user", "id name email");
        res.json(orders);
    })
);

// User login orders
orderRouter.get(
    "/",
    protect,
    asyncHandler(async (req, res) => {
        const order = await Order.find({ user: req.user._id }).sort({
            _id: -1,
        });
        res.json(order);
    })
);

// Get order by id
orderRouter.get(
    "/:id",
    protect,
    asyncHandler(async (req, res) => {
        const order = await Order.findById(req.params.id).populate(
            "user",
            "name email"
        );

        if (order) {
            res.json(order);
        } else {
            res.status(404);
            throw new Error("Order Not Found");
        }
    })
);

// Order is paid
orderRouter.put(
    "/:id/delivered",
    protect,
    admin,
    asyncHandler(async (req, res) => {
        const order = await Order.findById(req.params.id);

        if (order) {
            order.isDelivered = true;
            order.deliveredAt = Date.now();

            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404);
            throw new Error("Order Not Found");
        }
    })
);

// Order delivery status update
orderRouter.put(
    "/:id/delivery-status",
    protect,
    admin,
    asyncHandler(async (req, res) => {
        const order = await Order.findById(req.params.id);
        const newStatus = req.body.status; // Expected: 'processing', 'shipping', 'delivered'

        if (!order) {
            res.status(404);
            throw new Error("Order Not Found");
        }

        // Admin can only set these specific statuses via this route
        const allowedStatuses = ["processing", "shipping", "delivered"];
        if (!allowedStatuses.includes(newStatus)) {
            res.status(400);
            throw new Error(
                `Trạng thái không hợp lệ: ${newStatus}. Chỉ chấp nhận: processing, shipping, delivered.`
            );
        }

        // Check current order status - prevent setting if in cancellation/return flow already handled by admin
        if (
            [
                "cancelled",
                "returned",
                "cancellation_rejected",
                "return_rejected",
            ].includes(order.status)
        ) {
            res.status(400);
            throw new Error(
                `Đơn hàng đã ở trạng thái cuối cùng (${order.status}), không thể cập nhật qua đường dẫn này.`
            );
        }
        // Also prevent if there's an active request unless admin is explicitly overriding via approve/reject routes
        if (
            ["cancellation_requested", "return_requested"].includes(
                order.status
            ) &&
            newStatus !== order.status
        ) {
            res.status(400);
            throw new Error(
                `Đơn hàng đang có yêu cầu ${order.status}, vui lòng duyệt hoặc từ chối yêu cầu trước.`
            );
        }

        // Ensure order is paid before processing/shipping/delivering
        if (
            !order.isPaid &&
            (newStatus === "processing" ||
                newStatus === "shipping" ||
                newStatus === "delivered")
        ) {
            res.status(400);
            throw new Error(
                "Đơn hàng phải được thanh toán trước khi cập nhật trạng thái giao hàng."
            );
        }

        // Update status and history
        if (order.status !== newStatus) {
            order.status = newStatus;
            order.orderStatusHistory.push({
                status: newStatus,
                updatedAt: Date.now(),
                updatedBy: req.user._id, // Admin ID
                notes: `Admin cập nhật trạng thái thành: ${newStatus}`,
            });

            if (newStatus === "delivered") {
                order.deliveredAt = Date.now();
            } else if (newStatus === "shipping" && !order.shippedAt) {
                // Optional: add shippedAt field if needed
                // order.shippedAt = Date.now();
            }
        } else {
            // If status is the same, no update needed or send back current order
            res.json(order);
            return;
        }

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    })
);

// Update payment status
orderRouter.put(
    "/:id/payment-status",
    protect,
    admin,
    asyncHandler(async (req, res) => {
        const order = await Order.findById(req.params.id);

        if (order) {
            const newIsPaidStatus = req.body.isPaid;

            // Kiểm tra nếu cố gắng chuyển từ đã thanh toán (true) sang chưa thanh toán (false)
            if (order.isPaid && !newIsPaidStatus) {
                res.status(400);
                throw new Error(
                    "Không thể chuyển trạng thái từ 'Đã thanh toán' sang 'Chưa thanh toán'."
                );
            }

            // Nếu không có thay đổi trạng thái thanh toán thực sự
            if (order.isPaid === newIsPaidStatus) {
                // Vẫn có thể cập nhật ghi chú hoặc các thông tin khác nếu có
                // res.json(order); // Trả về đơn hàng hiện tại
                // Hoặc nếu chỉ cập nhật isPaid, có thể báo không có gì thay đổi
                // res.status(200).json({ message: "Trạng thái thanh toán không thay đổi.", order});
                // return;
                // Quyết định: Nếu không thay đổi isPaid, không cập nhật paidAt, status liên quan đến thanh toán
            }

            if (newIsPaidStatus && !order.isPaid) {
                // Chỉ cập nhật khi chuyển từ chưa thanh toán sang đã thanh toán
                order.isPaid = true;
                order.paidAt = Date.now();
                // Khi thanh toán, trạng thái nên chuyển thành 'paid' (chờ xử lý) hoặc 'processing'
                // Nếu đơn hàng đang ở 'pending', chuyển sang 'paid'. Các trạng thái khác không tự động đổi qua đây.
                if (order.status === "pending") {
                    order.status = "paid";
                    order.orderStatusHistory.push({
                        status: "paid",
                        updatedAt: Date.now(),
                        updatedBy: req.user._id, // Admin cập nhật
                        notes: "Đơn hàng được xác nhận thanh toán bởi admin.",
                    });
                } else if (
                    order.status !== "paid" &&
                    order.status !== "processing" &&
                    order.status !== "shipping" &&
                    order.status !== "delivered" &&
                    order.status !== "cancelled" &&
                    order.status !== "returned"
                ) {
                    // Nếu đang ở một trạng thái không mong muốn để chuyển sang paid, có thể throw error hoặc log
                    // Ví dụ: không nên cho chuyển từ 'cancellation_requested' sang 'paid' trực tiếp qua API này
                    res.status(400);
                    throw new Error(
                        `Không thể cập nhật thanh toán cho đơn hàng có trạng thái ${order.status}.`
                    );
                }
                // Nếu đã là 'paid' hoặc các trạng thái sau đó (processing, shipping, delivered) thì không đổi status ở đây nữa.
            }
            // Trường hợp newIsPaidStatus là false và order.isPaid cũng là false (chưa thanh toán -> vẫn chưa thanh toán) thì không làm gì ở trên.

            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404);
            throw new Error("Order Not Found");
        }
    })
);

// ==== CUSTOMER REQUEST ROUTES ====

// Customer request cancel order
orderRouter.put(
    "/:id/request-cancel",
    protect, // Chỉ user đã login
    asyncHandler(async (req, res) => {
        const order = await Order.findById(req.params.id);
        const { reason } = req.body;

        if (!order) {
            res.status(404);
            throw new Error("Đơn hàng không tìm thấy.");
        }

        // Chỉ chủ đơn hàng mới được yêu cầu hủy
        if (order.user.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error("Không có quyền thao tác trên đơn hàng này.");
        }

        // Điều kiện hủy:
        // - Chưa giao hàng (status: pending, paid, processing)
        // - Không cho phép hủy khi: đang giao (shipping), đã giao (delivered)
        if (order.status === "shipping" || order.status === "delivered") {
            res.status(400);
            throw new Error(
                "Không thể hủy đơn hàng đang giao hoặc đã được giao."
            );
        }
        //  - Đơn hàng chưa thanh toán (isPaid = false) -> status: pending
        //  - Đã thanh toán (isPaid = true) -> status: paid, processing
        //  (Logic trên đã bao gồm các trường hợp này)

        if (
            [
                "cancellation_requested",
                "cancelled",
                "return_requested",
                "returned",
            ].includes(order.status)
        ) {
            res.status(400);
            throw new Error(
                "Đơn hàng đã có yêu cầu hủy/hoàn hoặc đã được xử lý trước đó."
            );
        }

        if (!reason) {
            res.status(400);
            throw new Error("Vui lòng cung cấp lý do hủy đơn.");
        }

        order.status = "cancellation_requested";
        order.cancellationReason = reason;
        order.orderStatusHistory.push({
            status: "cancellation_requested",
            updatedAt: Date.now(),
            updatedBy: req.user._id,
            notes: `Khách hàng yêu cầu hủy. Lý do: ${reason}`,
        });

        await order.save();
        // TODO: Gửi thông báo cho Admin
        res.json({
            message: "Yêu cầu hủy đơn đã được gửi đi. Chờ admin xác nhận.",
            order,
        });
    })
);

// Customer request return order
orderRouter.put(
    "/:id/request-return",
    protect, // Chỉ user đã login
    asyncHandler(async (req, res) => {
        const order = await Order.findById(req.params.id);
        const { reason } = req.body;

        if (!order) {
            res.status(404);
            throw new Error("Đơn hàng không tìm thấy.");
        }

        // Chỉ chủ đơn hàng mới được yêu cầu hoàn
        if (order.user.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error("Không có quyền thao tác trên đơn hàng này.");
        }

        // Điều kiện hoàn:
        // - Đã giao hàng (status: delivered)
        if (order.status !== "delivered") {
            res.status(400);
            throw new Error(
                "Chỉ có thể yêu cầu hoàn hàng cho đơn đã được giao."
            );
        }

        if (
            [
                "cancellation_requested",
                "cancelled",
                "return_requested",
                "returned",
            ].includes(order.status)
        ) {
            res.status(400);
            throw new Error(
                "Đơn hàng đã có yêu cầu hủy/hoàn hoặc đã được xử lý trước đó."
            );
        }

        if (!reason) {
            res.status(400);
            throw new Error("Vui lòng cung cấp lý do hoàn hàng.");
        }

        order.status = "return_requested";
        order.returnReasonCustomer = reason; // Sử dụng trường mới
        order.orderStatusHistory.push({
            status: "return_requested",
            updatedAt: Date.now(),
            updatedBy: req.user._id,
            notes: `Khách hàng yêu cầu hoàn hàng. Lý do: ${reason}`,
        });

        await order.save();
        // TODO: Gửi thông báo cho Admin
        res.json({
            message: "Yêu cầu hoàn hàng đã được gửi đi. Chờ admin xác nhận.",
            order,
        });
    })
);

// ==== ADMIN ACTION ROUTES ====

// Admin approve cancel order
orderRouter.put(
    "/:id/admin/approve-cancel",
    protect,
    admin, // Chỉ admin
    asyncHandler(async (req, res) => {
        const order = await Order.findById(req.params.id);
        const { adminNote } = req.body; // Admin có thể thêm ghi chú

        if (!order) {
            res.status(404);
            throw new Error("Đơn hàng không tìm thấy.");
        }

        if (order.status !== "cancellation_requested") {
            res.status(400);
            throw new Error(
                "Đơn hàng này không có yêu cầu hủy hoặc đã được xử lý."
            );
        }

        order.status = "cancelled";
        order.adminCancellationNote = adminNote || "Đã duyệt hủy bởi admin";
        // order.isCancelled = true; // Không cần trường isCancelled riêng nữa
        order.orderStatusHistory.push({
            status: "cancelled",
            updatedAt: Date.now(),
            updatedBy: req.user._id, // ID của Admin
            notes: `Admin duyệt hủy. ${
                adminNote ? `Ghi chú: ${adminNote}` : ""
            }`,
        });

        // Hoàn trả sản phẩm vào kho
        for (const item of order.orderItems) {
            const product = await Product.findById(item.product);
            if (product) {
                product.countInStock += item.qty;
                product.sold -= item.qty; // Giảm số lượng đã bán khi hủy
                await product.save();
            }
        }

        // TODO: Xử lý hoàn tiền nếu isPaid = true
        if (order.isPaid) {
            // Logic hoàn tiền ở đây (ví dụ: gọi API cổng thanh toán, hoặc ghi nhận chờ hoàn tiền thủ công)
            // For now, just log it or add a note
            order.orderStatusHistory.push({
                status: "cancelled",
                updatedAt: Date.now(),
                updatedBy: req.user._id,
                notes: "Đơn hàng đã thanh toán, cần xử lý hoàn tiền.",
            });
        }

        await order.save();
        // TODO: Gửi thông báo cho Khách hàng
        res.json({ message: "Đã duyệt hủy đơn hàng.", order });
    })
);

// Admin reject cancel order
orderRouter.put(
    "/:id/admin/reject-cancel",
    protect,
    admin, // Chỉ admin
    asyncHandler(async (req, res) => {
        const order = await Order.findById(req.params.id);
        const { adminNote } = req.body;

        if (!order) {
            res.status(404);
            throw new Error("Đơn hàng không tìm thấy.");
        }

        if (order.status !== "cancellation_requested") {
            res.status(400);
            throw new Error(
                "Đơn hàng này không có yêu cầu hủy hoặc đã được xử lý."
            );
        }

        if (!adminNote) {
            res.status(400);
            throw new Error("Vui lòng cung cấp lý do từ chối hủy đơn.");
        }

        // Tìm trạng thái trước đó từ orderStatusHistory
        // Lấy trạng thái ngay trước 'cancellation_requested'
        let previousStatus = "pending"; // Mặc định nếu không tìm thấy
        if (order.orderStatusHistory.length > 1) {
            // Tìm entry cuối cùng không phải là 'cancellation_requested'
            for (let i = order.orderStatusHistory.length - 2; i >= 0; i--) {
                if (
                    order.orderStatusHistory[i].status !==
                    "cancellation_requested"
                ) {
                    previousStatus = order.orderStatusHistory[i].status;
                    break;
                }
            }
        }

        order.status = previousStatus; // Hoặc có thể dùng status 'cancellation_rejected'
        // Quyết định dùng 'cancellation_rejected' để rõ ràng hơn
        order.status = "cancellation_rejected";
        order.adminCancellationNote = adminNote;
        order.orderStatusHistory.push({
            status: "cancellation_rejected",
            updatedAt: Date.now(),
            updatedBy: req.user._id,
            notes: `Admin từ chối hủy. Lý do: ${adminNote}`,
        });

        await order.save();
        // TODO: Gửi thông báo cho Khách hàng
        res.json({ message: "Đã từ chối yêu cầu hủy đơn hàng.", order });
    })
);

// Admin approve return order
orderRouter.put(
    "/:id/admin/approve-return",
    protect,
    admin, // Chỉ admin
    asyncHandler(async (req, res) => {
        const order = await Order.findById(req.params.id);
        const { adminNote } = req.body;

        if (!order) {
            res.status(404);
            throw new Error("Đơn hàng không tìm thấy.");
        }

        if (order.status !== "return_requested") {
            res.status(400);
            throw new Error(
                "Đơn hàng này không có yêu cầu hoàn hoặc đã được xử lý."
            );
        }

        order.status = "returned";
        order.adminReturnNote = adminNote || "Đã duyệt hoàn hàng bởi admin";
        // order.isReturned = true; // Không cần nữa
        // order.returnedAt = Date.now(); // Sẽ được cập nhật qua timestamp của orderStatusHistory hoặc khi save() object chính
        order.orderStatusHistory.push({
            status: "returned",
            updatedAt: Date.now(),
            updatedBy: req.user._id,
            notes: `Admin duyệt hoàn hàng. ${
                adminNote ? `Ghi chú: ${adminNote}` : ""
            }`,
        });

        // Hoàn trả sản phẩm vào kho
        for (const item of order.orderItems) {
            const product = await Product.findById(item.product);
            if (product) {
                product.countInStock += item.qty;
                product.sold -= item.qty; // Giảm số lượng đã bán khi hoàn hàng
                await product.save();
            }
        }

        // Xử lý hoàn tiền (luôn cần vì đơn đã giao thường là đã thanh toán)
        // Logic hoàn tiền ở đây (ví dụ: gọi API cổng thanh toán, hoặc ghi nhận chờ hoàn tiền thủ công)
        order.orderStatusHistory.push({
            status: "returned",
            updatedAt: Date.now(),
            updatedBy: req.user._id,
            notes: "Đơn hàng đã thanh toán, cần xử lý hoàn tiền cho khách.",
        });

        await order.save();
        // TODO: Gửi thông báo cho Khách hàng
        res.json({ message: "Đã duyệt hoàn hàng.", order });
    })
);

// Admin reject return order
orderRouter.put(
    "/:id/admin/reject-return",
    protect,
    admin, // Chỉ admin
    asyncHandler(async (req, res) => {
        const order = await Order.findById(req.params.id);
        const { adminNote } = req.body;

        if (!order) {
            res.status(404);
            throw new Error("Đơn hàng không tìm thấy.");
        }

        if (order.status !== "return_requested") {
            res.status(400);
            throw new Error(
                "Đơn hàng này không có yêu cầu hoàn hoặc đã được xử lý."
            );
        }

        if (!adminNote) {
            res.status(400);
            throw new Error("Vui lòng cung cấp lý do từ chối hoàn hàng.");
        }

        // Tìm trạng thái trước đó từ orderStatusHistory
        // Lấy trạng thái ngay trước 'return_requested'
        let previousStatus = "delivered"; // Mặc định nếu không tìm thấy
        if (order.orderStatusHistory.length > 1) {
            for (let i = order.orderStatusHistory.length - 2; i >= 0; i--) {
                if (order.orderStatusHistory[i].status !== "return_requested") {
                    previousStatus = order.orderStatusHistory[i].status;
                    break;
                }
            }
        }

        order.status = previousStatus; // Hoặc có thể dùng status 'return_rejected'
        // Quyết định dùng 'return_rejected' để rõ ràng hơn
        order.status = "return_rejected";
        order.adminReturnNote = adminNote;
        order.orderStatusHistory.push({
            status: "return_rejected",
            updatedAt: Date.now(),
            updatedBy: req.user._id,
            notes: `Admin từ chối hoàn hàng. Lý do: ${adminNote}`,
        });

        await order.save();
        // TODO: Gửi thông báo cho Khách hàng
        res.json({ message: "Đã từ chối yêu cầu hoàn hàng.", order });
    })
);

export default orderRouter;
