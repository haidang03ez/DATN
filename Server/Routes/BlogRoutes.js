import express from "express";
import blogController from "../controllers/blogController.js";
import { admin, protect } from "../Middleware/AuthMiddleware.js";

const router = express.Router();

router.get("/", blogController.getBlogs);
router.get("/:id", blogController.getBlogById);
router.post("/", protect, admin, blogController.createBlog);
router.put("/:id", protect, admin, blogController.updateBlog);
router.delete("/:id", protect, admin, blogController.deleteBlog);

export default router;
