import express from "express";
import mongoose from "mongoose";
import { createServer } from "node:http";
import { connectToSocket } from "./controllers/manageSocketio.js";
import userRoutes from "./routes/users.routes.js";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();  // ✅ Load .env file

const app = express();
const server = createServer(app);
const io = connectToSocket(server);

app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

app.set("port", process.env.PORT || 8000);

app.get("/home", (req, res) => {
    return res.json({ "hello": "world" });
});

app.use("/api/v1/users", userRoutes);

const start = async () => {
    try {
        const connectionDb = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log(`✅ Database connected to ${connectionDb.connection.host}`);

        server.listen(app.get("port"), () => {
            console.log(`🚀 App is Listening on Port ${app.get("port")}`);
        });
    } catch (error) {
        console.error("❌ MongoDB connection error:", error);
        process.exit(1);
    }
};

start();
