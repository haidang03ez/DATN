import mongoose from "mongoose";

const orderSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
        orderItems: [
            {
                name: { type: String, required: true },
                qty: { type: Number, required: true },
                image: { type: mongoose.Schema.Types.Mixed, required: true },
                price: { type: Number, required: true },
                discountedPrice: { type: Number, required: true },
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true,
                    ref: "Product",
                },
            },
        ],
        shippingAddress: {
            address: { type: String, required: true },
            city: { type: String },
            postalCode: { type: String },
            country: { type: String },
            phoneNumber: { type: String, required: true },
        },
        paymentMethod: {
            type: String,
            required: true,
            default: "Paypal",
        },
        paymentResult: {
            id: { type: String },
            status: { type: String },
            update_time: { type: String },
            email_address: { type: String },
        },
        taxPrice: {
            type: Number,
            required: true,
            default: 0.0,
        },
        shippingPrice: {
            type: Number,
            required: true,
            default: 0.0,
        },
        totalPrice: {
            type: Number,
            required: true,
            default: 0.0,
        },
        isPaid: {
            type: Boolean,
            required: true,
            default: false,
        },
        paidAt: {
            type: Date,
        },
        status: {
            type: String,
            required: true,
            enum: [
                "pending",
                "paid",
                "processing",
                "shipping",
                "delivered",
                "cancellation_requested",
                "cancelled",
                "return_requested",
                "returned",
                "cancellation_rejected",
                "return_rejected",
            ],
            default: "pending",
        },
        deliveredAt: {
            type: Date,
        },
        cancellationReason: {
            type: String,
        },
        returnReasonCustomer: {
            type: String,
        },
        adminCancellationNote: {
            type: String,
        },
        adminReturnNote: {
            type: String,
        },
        orderStatusHistory: [
            {
                status: { type: String, required: true },
                updatedAt: { type: Date, default: Date.now },
                updatedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
                notes: { type: String },
            },
        ],
    },
    {
        timestamps: true,
    }
);

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;
