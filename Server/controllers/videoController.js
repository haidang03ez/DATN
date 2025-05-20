import Video from "../Models/Video.js";

const videoController = {
    // Lấy tất cả video
    getVideos: async (req, res) => {
        const videos = await Video.find()
            .sort({ createdAt: -1 })
            .populate("createdBy", "name email")
            .populate("updatedBy", "name email");
        res.json(videos);
    },

    // Lấy chi tiết video (Thêm mới nếu cần, hoặc có thể không cần thiết cho Video)
    getVideoById: async (req, res) => {
        const video = await Video.findById(req.params.id)
            .populate("createdBy", "name email")
            .populate("updatedBy", "name email");
        if (!video) return res.status(404).json({ message: "Video not found" });
        res.json(video);
    },

    // Thêm video mới
    createVideo: async (req, res) => {
        const { title, youtubeId } = req.body;
        const video = new Video({
            title,
            youtubeId,
            createdBy: req.user._id, // Assuming req.user contains the logged-in user's info
        });
        await video.save();
        res.status(201).json(video);
    },

    // Sửa video
    updateVideo: async (req, res) => {
        const { title, youtubeId } = req.body;
        const video = await Video.findById(req.params.id);
        if (!video) return res.status(404).json({ message: "Video not found" });

        video.title = title || video.title;
        video.youtubeId = youtubeId || video.youtubeId;
        video.updatedBy = req.user._id; // Assuming req.user contains the logged-in user's info

        await video.save();
        res.json(video);
    },

    // Xoá video
    deleteVideo: async (req, res) => {
        await Video.findByIdAndDelete(req.params.id);
        res.json({ message: "Video deleted" });
    },
};

export default videoController;
