import mongoose from "mongoose";

const blogSchema = mongoose.Schema(
    {
        title: { type: String, required: true },
        image: { type: String, required: true },
        content: { type: String, required: true },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // Assuming your user model is named 'User'
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

const Blog = mongoose.model("Blog", blogSchema);
export default Blog;
