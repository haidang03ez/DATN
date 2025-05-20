import mongoose from "mongoose";

const importRecordSchema = mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Product",
        },
        supplier: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Supplier",
        },
        quantity: {
            type: Number,
            required: true,
            default: 0,
        },
        importPrice: {
            type: Number,
            required: true,
            default: 0,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
);

const ImportRecord =
    mongoose.models.ImportRecord ||
    mongoose.model("ImportRecord", importRecordSchema);

export default ImportRecord;
