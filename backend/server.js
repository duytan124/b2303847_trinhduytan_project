import app from "./app.js";
import config from "./src/config/index.js";
import mongoose from "mongoose";
import redisClient from "./src/config/redis.js"; // [THÊM MỚI] Import redisClient

const PORT = config.src.port;

async function startServer() {
    try {
        // 1. Kết nối cơ sở dữ liệu MongoDB
        await mongoose.connect(config.db.uri);
        console.log("Connected to the database!");

        // 2. [THÊM MỚI] Kết nối Redis Cache
        // Đảm bảo redisClient chưa mở kết nối thì mới gọi connect()
        if (!redisClient.isOpen) {
            await redisClient.connect();
            console.log("Connected to Redis Cache!");
        }

        // 3. Khởi động Web Server
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

    } catch (error) {
        console.log(`Cannot connect to the databases! ${error}`);
        process.exit();
    }
}

startServer();