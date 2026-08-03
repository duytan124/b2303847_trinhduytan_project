import redisClient from '../config/redis.js';

export const cacheBookSearch = async (req, res, next) => {
    // Chỉ cache các request tìm kiếm có query ?q= (hoặc lấy mặc định 'all')
    const query = req.query.q || req.query.title || 'all';
    const cacheKey = `books:search:${query}`;

    // Gán sẵn cacheKey để Controller có thể dùng ghi Cache nếu cần
    req.cacheKey = cacheKey;

    // ⚡ 1. Kiểm tra nếu Redis đang tắt/chưa sẵn sàng -> Bỏ qua ngay lập tức, không gọi get()
    if (!redisClient.isOpen) {
        return next();
    }

    try {
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
            console.log('⚡ Redis: Cache Hit');
            return res.status(200).json(JSON.parse(cachedData));
        }

        console.log('🐢 Redis: Cache Miss');
        next();
    } catch (error) {
        // ⚡ 2. Chỉ in thông điệp lỗi ngắn gọn thay vì in full stack trace làm bẩn terminal
        console.warn('⚠️ [REDIS ERROR]:', error.message);
        next(); // Lỗi Redis thì vẫn cho tiếp tục sang DB
    }
};