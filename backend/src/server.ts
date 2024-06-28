import dotenv from "dotenv";
import express from "express";
import { createServer } from "http";
import mongoose from "mongoose";
import routes from "./routes/routes";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectCloudinary } from "./lib/cloudinary";

dotenv.config();
connectCloudinary(
    process.env.CLOUDINARY_CLOUD_NAME as string,
    process.env.CLOUDINARY_API_KEY as string,
    process.env.CLOUDINARY_API_SECRET as string
);

const port = process.env.PORT || 3000;

const app = express();
const httpServer = createServer(app);

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use("/api", routes);

// Serve frontend
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));

    app.get("*", (req, res) =>
        res.sendFile(
            path.resolve(__dirname, "../frontend", "dist", "index.html")
        )
    );
} else {
    app.get("/", (req, res) => {
        res.send("API is running...");
    });
}

httpServer.listen(port, () => {
    mongoose.connect(process.env.MONGODB_URI as string);
    console.log(
        `MongoDB connected.\nClouinary connected.\nServer listening on port ${port}\nhttp://localhost:${port}`
    );
});
