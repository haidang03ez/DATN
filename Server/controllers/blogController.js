import Blog from "../Models/Blog.js";

const blogController = {
    // Lấy tất cả blog
    getBlogs: async (req, res) => {
        const blogs = await Blog.find()
            .sort({ createdAt: -1 })
            .populate("createdBy", "name email")
            .populate("updatedBy", "name email");
        res.json(blogs);
    },

    // Lấy chi tiết blog
    getBlogById: async (req, res) => {
        const blog = await Blog.findById(req.params.id)
            .populate("createdBy", "name email")
            .populate("updatedBy", "name email");
        if (!blog) return res.status(404).json({ message: "Blog not found" });
        res.json(blog);
    },

    // Thêm blog mới
    createBlog: async (req, res) => {
        const { title, image, content } = req.body;
        const blog = new Blog({
            title,
            image,
            content,
            createdBy: req.user._id, // Assuming req.user contains the logged-in user's info
        });
        await blog.save();
        res.status(201).json(blog);
    },

    // Sửa blog
    updateBlog: async (req, res) => {
        const { title, image, content } = req.body;
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ message: "Blog not found" });
        blog.title = title;
        blog.image = image;
        blog.content = content;
        blog.updatedBy = req.user._id; // Assuming req.user contains the logged-in user's info
        await blog.save();
        res.json(blog);
    },

    // Xoá blog
    deleteBlog: async (req, res) => {
        await Blog.findByIdAndDelete(req.params.id);
        res.json({ message: "Blog deleted" });
    },
};

export default blogController;
