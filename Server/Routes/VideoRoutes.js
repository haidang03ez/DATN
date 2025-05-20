import express from "express";
import videoController from "../controllers/videoController.js";
import { admin, protect } from "../Middleware/AuthMiddleware.js";

const router = express.Router();

router.get("/", videoController.getVideos);
router.post("/", protect, admin, videoController.createVideo);
router.get("/:id", protect, admin, videoController.getVideoById);
router.put("/:id", protect, admin, videoController.updateVideo);
router.delete("/:id", protect, admin, videoController.deleteVideo);

export default router;
