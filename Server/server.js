import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fileUpload from "express-fileupload";
import connectDatabase from "./config/MongoDB.js";
import ImportData from "./DataImport.js";
import { errorHandler, notFound } from "./Middleware/Errors.js";
import categoryRouter from "./Routes/CategoryRoutes.js";
import orderRouter from "./Routes/OrderRoutes.js";
import productRouter from "./Routes/ProductRoutes.js";
import uploadRouter from "./Routes/UploadRoutes.js";
import userRouter from "./Routes/UserRoutes.js";
import videoRoutes from "./Routes/VideoRoutes.js";
import blogRoutes from "./Routes/BlogRoutes.js";
import statisticsRoutes from "./Routes/StatisticsRoutes.js";
import promotionRouter from "./Routes/PromotionRoutes.js";
import supplierRouter from "./Routes/SupplierRoutes.js";

dotenv.config();
connectDatabase();
const app = express();
app.use(express.json());
app.use(cors());
app.use(
    fileUpload({
        useTempFiles: true,
    })
);

// API
app.use("/api/import", ImportData);
app.use("/api/categories", categoryRouter);
app.use("/api/products", productRouter);
app.use("/api/users", userRouter);
app.use("/api/orders", orderRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/videos", videoRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/statistics", statisticsRoutes);
app.use("/api/promotions", promotionRouter);
app.use("/api/suppliers", supplierRouter);
app.get("/api/config/paypal", (req, res) => {
    res.send(process.env.PAYPAL_CLIENT_ID);
});

// ERROR HANDLE
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 1000;

app.listen(PORT, console.log(`Server run in port ${PORT}`));
