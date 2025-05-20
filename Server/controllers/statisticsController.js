import Order from "../Models/OrderModel.js";
import Product from "../Models/ProductModel.js";
import ImportRecord from "../Models/ImportRecordModel.js";
import mongoose from "mongoose";

const statisticsController = {
    // Lấy thống kê tổng hợp theo ngày/tháng/năm
    getStats: async (req, res) => {
        try {
            const { from, to } = req.query;

            // Base match for paid orders within date range for revenue and sales stats
            const baseMatchConditions = {
                isPaid: true,
                status: {
                    $nin: [
                        "cancelled",
                        "cancellation_requested",
                        "returned",
                        "return_requested",
                        "pending", // Cũng loại bỏ pending vì chưa chắc chắn thành công
                    ],
                },
            };

            if (from || to) {
                baseMatchConditions.paidAt = {};
                if (from) baseMatchConditions.paidAt.$gte = new Date(from);
                if (to) {
                    const toDate = new Date(to);
                    toDate.setHours(23, 59, 59, 999); // Đặt thời gian đến cuối ngày
                    baseMatchConditions.paidAt.$lte = toDate;
                }
            }

            const ordersForRevenue = await Order.find(baseMatchConditions);

            const totalRevenue = ordersForRevenue.reduce(
                (sum, order) => sum + order.totalPrice,
                0
            );

            // Product stats: sold, returned (within the period for more accuracy if needed)
            // For sold count, we should also filter by successful statuses
            const productStats = {};
            ordersForRevenue.forEach((order) => {
                order.orderItems.forEach((item) => {
                    if (!productStats[item.product]) {
                        productStats[item.product] = {
                            product: item.product,
                            name: item.name,
                            image: item.image,
                            sold: 0,
                            // returnedInPeriod: 0, // Có thể thêm nếu muốn tracking hoàn trả trong kỳ cụ thể cho thống kê lợi nhuận
                            sellingPrice: item.discountedPrice, // Sử dụng giá đã giảm
                            purchasePrice: 0, // Sẽ được tính sau
                        };
                    }
                    productStats[item.product].sold += item.qty;
                });
            });

            // Lấy thông tin giá nhập từ ImportRecords (logic này giữ nguyên)
            const productIds = Object.keys(productStats);
            const importRecords = await ImportRecord.find({
                product: { $in: productIds },
            });
            const productPurchaseCostData = {};
            importRecords.forEach((record) => {
                const productIdString = record.product.toString();
                if (!productPurchaseCostData[productIdString]) {
                    productPurchaseCostData[productIdString] = {
                        totalCost: 0,
                        totalQuantity: 0,
                    };
                }
                if (
                    typeof record.importPrice === "number" &&
                    typeof record.quantity === "number"
                ) {
                    productPurchaseCostData[productIdString].totalCost +=
                        record.importPrice * record.quantity;
                    productPurchaseCostData[productIdString].totalQuantity +=
                        record.quantity;
                }
            });

            Object.keys(productStats).forEach((productId) => {
                if (
                    productPurchaseCostData[productId] &&
                    productPurchaseCostData[productId].totalQuantity > 0
                ) {
                    productStats[productId].purchasePrice =
                        productPurchaseCostData[productId].totalCost /
                        productPurchaseCostData[productId].totalQuantity;
                } else {
                    productStats[productId].purchasePrice =
                        productStats[productId].sellingPrice; // Giả định giá mua bằng giá bán nếu không có record nhập để lợi nhuận = 0
                }
            });

            const soldProductsArray = Object.values(productStats)
                .filter((p) => p.sold > 0)
                .sort((a, b) => b.sold - a.sold);

            const top5Sold = soldProductsArray.slice(0, 5);

            const totalProfit = soldProductsArray.reduce((sum, p) => {
                // Lợi nhuận tính trên sản phẩm thực sự bán được (đã trừ hoàn nếu logic hoàn được tích hợp vào đây)
                // Hiện tại, ordersForRevenue đã loại các đơn 'returned' nên p.sold là số lượng bán thành công
                return sum + (p.sellingPrice - p.purchasePrice) * p.sold;
            }, 0);

            // Thống kê số lượng các loại đơn hàng khác
            const matchAllTime = {};
            if (from || to) {
                matchAllTime.createdAt = {};
                if (from) matchAllTime.createdAt.$gte = new Date(from);
                if (to) {
                    const toDate = new Date(to);
                    toDate.setHours(23, 59, 59, 999); // Đặt thời gian đến cuối ngày
                    matchAllTime.createdAt.$lte = toDate;
                }
            }

            const totalOrders = await Order.countDocuments(matchAllTime);
            const pendingOrders = await Order.countDocuments({
                ...matchAllTime,
                status: "pending",
            });
            const paidOrders = await Order.countDocuments({
                ...matchAllTime,
                status: "paid",
            });
            const processingOrders = await Order.countDocuments({
                ...matchAllTime,
                status: "processing",
            });
            const shippingOrders = await Order.countDocuments({
                ...matchAllTime,
                status: "shipping",
            });
            const deliveredOrders = await Order.countDocuments({
                ...matchAllTime,
                status: "delivered",
            });

            const cancellationRequestedOrders = await Order.countDocuments({
                ...matchAllTime,
                status: "cancellation_requested",
            });
            const cancelledOrders = await Order.countDocuments({
                ...matchAllTime,
                status: "cancelled",
            });
            const cancellationRejectedOrders = await Order.countDocuments({
                ...matchAllTime,
                status: "cancellation_rejected",
            });

            const returnRequestedOrders = await Order.countDocuments({
                ...matchAllTime,
                status: "return_requested",
            });
            const returnedOrders = await Order.countDocuments({
                ...matchAllTime,
                status: "returned",
            });
            const returnRejectedOrders = await Order.countDocuments({
                ...matchAllTime,
                status: "return_rejected",
            });

            // === BẮT ĐẦU LOGIC THỐNG KÊ ĐÁNH GIÁ ===
            const productsWithReviews = await Product.find({
                "reviews.0": { $exists: true },
            }).select("reviews");
            let totalReviewsCount = 0;
            const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
            let totalRatingSum = 0;

            productsWithReviews.forEach((product) => {
                if (product.reviews && product.reviews.length > 0) {
                    product.reviews.forEach((review) => {
                        totalReviewsCount++;
                        if (review.rating >= 1 && review.rating <= 5) {
                            ratingDistribution[review.rating]++;
                            totalRatingSum += review.rating;
                        }
                    });
                }
            });

            const averageRating =
                totalReviewsCount > 0
                    ? (totalRatingSum / totalReviewsCount).toFixed(2)
                    : 0;
            // === KẾT THÚC LOGIC THỐNG KÊ ĐÁNH GIÁ ===

            res.json({
                summary: {
                    totalRevenue,
                    totalProfit,
                    totalSoldUnits: soldProductsArray.reduce(
                        (sum, p) => sum + p.sold,
                        0
                    ),
                    totalOrders,
                },
                orderStatusCounts: {
                    pending: pendingOrders,
                    paid: paidOrders,
                    processing: processingOrders,
                    shipping: shippingOrders,
                    delivered: deliveredOrders,
                    cancellationRequested: cancellationRequestedOrders,
                    cancelled: cancelledOrders,
                    cancellationRejected: cancellationRejectedOrders,
                    returnRequested: returnRequestedOrders,
                    returned: returnedOrders,
                    returnRejected: returnRejectedOrders,
                },
                detailedProductStats: soldProductsArray,
                top5SoldProducts: top5Sold,
                reviewStats: {
                    totalReviews: totalReviewsCount,
                    distribution: ratingDistribution,
                    averageRating: parseFloat(averageRating),
                },
            });
        } catch (error) {
            console.error("Error in getStats:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },
};

export default statisticsController;
