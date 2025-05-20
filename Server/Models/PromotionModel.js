import mongoose from "mongoose";

const promotionSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: false,
        },
        discountPercentage: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        targetType: {
            type: String,
            required: true,
            enum: ["All", "Category", "Product"],
            default: "All",
        },
        targetCategories: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Category",
            },
        ],
        targetProducts: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Middleware để đảm bảo endDate phải lớn hơn startDate
promotionSchema.pre("save", function (next) {
    if (this.endDate <= this.startDate) {
        next(new Error("End date must be after start date"));
    } else {
        next();
    }
});

const Promotion = mongoose.model("Promotion", promotionSchema);

export default Promotion;
