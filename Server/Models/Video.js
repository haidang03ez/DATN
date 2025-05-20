import mongoose from "mongoose";

const videoSchema = mongoose.Schema(
    {
        title: { type: String, required: true },
        youtubeId: { type: String, required: true },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

const Video = mongoose.model("Video", videoSchema);
export default Video;
