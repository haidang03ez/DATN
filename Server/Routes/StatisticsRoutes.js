import express from "express";
import statisticsController from "../controllers/statisticsController.js";
const router = express.Router();

router.get("/", statisticsController.getStats);
 
export default router; 