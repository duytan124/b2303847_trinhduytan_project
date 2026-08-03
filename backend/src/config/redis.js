import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config();

const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    socket: {
        connectTimeout: 500, // ⚡ Timeout kết nối tối đa 500ms (không cho chờ lâu)
        reconnectStrategy: (retries) => {
            // Ngừng thử lại sau 2 lần thất bại để tránh làm ngẽn tiến trình
            if (retries > 2) {
                return new Error("Redis connection failed");
            }
            return 500; // Thử lại sau 500ms
        }
    }
});

// Bắt lỗi ngầm để tránh ngắt đột ngột (crash) server Node.js
redisClient.on('error', (err) => {
    // Chỉ in log ngắn gọn khi lỗi kết nối xảy ra
    // console.error('❌ Redis Client Error:', err.message);
});

redisClient.on('connect', () => console.log('⚡ Redis connecting...'));
redisClient.on('ready', () => console.log('✅ Redis connected and ready to use!'));

// Tự động kết nối ngầm với xử lý ngoại lệ (Fall-back)
(async () => {
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
        }
    } catch (err) {
        console.warn('⚠️ Không thể kết nối Redis. Hệ thống tự động chuyển sang dùng MongoDB mặc định.');
    }
})();

export default redisClient;