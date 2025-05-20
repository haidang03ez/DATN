import mongoose from "mongoose";

const supplierSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        address: {
            type: String,
            trim: true,
        },
        phoneNumber: {
            type: String,
            trim: true,
        },
        email: {
            type: String,
            trim: true,
            unique: true,
            // Basic email validation, consider using a more robust validator if needed
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                "Please fill a valid email address",
            ],
        },
        description: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// To handle unique constraint errors more gracefully for email
supplierSchema.post("save", function (error, doc, next) {
    if (
        error.name === "MongoServerError" &&
        error.code === 11000 &&
        error.keyValue.email
    ) {
        next(new Error("Email already exists. Please use a different email."));
    } else if (
        error.name === "MongoServerError" &&
        error.code === 11000 &&
        error.keyValue.name
    ) {
        next(
            new Error(
                "Supplier name already exists. Please use a different name."
            )
        );
    } else {
        next(error);
    }
});

const Supplier = mongoose.model("Supplier", supplierSchema);

export default Supplier;
