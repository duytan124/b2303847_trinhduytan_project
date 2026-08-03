import Book from "../models/book.model.js";
import redisClient from "../config/redis.js"; // Import redisClient đã tạo

class BookService {
    // Thời gian sống của Cache: 15 phút (900 giây) theo đúng yêu cầu REQ_PER_01
    CACHE_TTL_SECONDS = 15 * 60;

    /**
     * Tự động xóa (Invalidate) toàn bộ Cache liên quan đến sách
     * Được gọi mỗi khi Thêm, Sửa, Xóa sách để đảm bảo tính nhất quán dữ liệu
     */
    async clearBookCache() {
        try {
            if (redisClient?.isOpen) {
                const keys = await redisClient.keys("books:*");
                if (keys.length > 0) {
                    await redisClient.del(keys);
                    console.log(`🧹 [Redis Cache Invalidated]: Đã xóa ${keys.length} keys cache sách`);
                }
            }
        } catch (error) {
            console.error("⚠️ Lỗi khi xóa Redis Cache:", error.message);
        }
    }

    /**
     * REQ_PER_01: Tìm kiếm & Lấy danh sách sách có tích hợp Cache-Aside Pattern
     */
    async find(filter = {}) {
        // 1. Tạo Cache Key duy nhất dựa trên bộ lọc filter
        const cacheKey = `books:find:${JSON.stringify(filter)}`;

        try {
            // 2. CHECK CACHE HIT (< 20ms)
            if (redisClient?.isOpen) {
                const cachedData = await redisClient.get(cacheKey);
                if (cachedData) {
                    console.log(`🚀 [REDIS CACHE HIT]: ${cacheKey}`);
                    return JSON.parse(cachedData);
                }
            }
        } catch (error) {
            console.error("⚠️ Lỗi đọc Cache Redis:", error.message);
        }

        // 3. CACHE MISS -> Truy vấn MongoDB
        console.log(`🐢 [MONGODB MISS]: Querying DB for key: ${cacheKey}`);
        const books = await Book.find(filter).populate("publisher_id");

        // 4. LƯU KẾT QUẢ VÀO REDIS (VỚI TTL 15 PHÚT)
        try {
            if (redisClient?.isOpen && books) {
                await redisClient.setEx(
                    cacheKey,
                    this.CACHE_TTL_SECONDS,
                    JSON.stringify(books)
                );
            }
        } catch (error) {
            console.error("⚠️ Lỗi ghi Cache Redis:", error.message);
        }

        return books;
    }

    /**
     * Lấy chi tiết 1 cuốn sách theo ID (Có Cache)
     */
    async findById(id) {
        const cacheKey = `books:id:${id}`;

        try {
            if (redisClient?.isOpen) {
                const cachedBook = await redisClient.get(cacheKey);
                if (cachedBook) {
                    console.log(`🚀 [REDIS CACHE HIT]: ${cacheKey}`);
                    return JSON.parse(cachedBook);
                }
            }
        } catch (error) {
            console.error("⚠️ Lỗi đọc Cache Redis:", error.message);
        }

        const book = await Book.findOne({ _id: id }).populate("publisher_id");

        try {
            if (redisClient?.isOpen && book) {
                await redisClient.setEx(
                    cacheKey,
                    this.CACHE_TTL_SECONDS,
                    JSON.stringify(book)
                );
            }
        } catch (error) {
            console.error("⚠️ Lỗi ghi Cache Redis:", error.message);
        }

        return book;
    }

    async findByName(name) {
        return await Book.find({
            title: { $regex: name, $options: "i" }
        });
    }

    /**
     * Tạo sách mới + Tự động xóa Cache cũ
     */
    async create(payload) {
        try {
            const bookData = {
                title: payload.title,
                genre: payload.genre,
                price: payload.price,
                quantity: payload.quantity,
                published_year: payload.published_year,
                publisher_id: payload.publisher_id,
                author: payload.author,
            };

            // Lọc bỏ các trường undefined
            Object.keys(bookData).forEach(key => {
                if (bookData[key] === undefined) {
                    delete bookData[key];
                }
            });

            const book = new Book(bookData);
            const savedBook = await book.save();

            // 📌 Xóa Cache cũ để người dùng tìm kiếm thấy sách mới ngay lập tức
            await this.clearBookCache();

            return savedBook;
        } catch (error) {
            console.error("❌ Lỗi create book:", error);
            throw error;
        }
    }

    /**
     * Cập nhật sách + Tự động xóa Cache cũ
     */
    async update(id, payload) {
        Object.keys(payload).forEach(key => {
            if (payload[key] === undefined || payload[key] === "" || payload[key] === null) {
                delete payload[key];
            }
        });

        const result = await Book.findByIdAndUpdate(
            id, { $set: payload }, { new: true, runValidators: true }
        );

        // 📌 Xóa Cache cũ để đảm bảo thông tin sách mới sửa được cập nhật
        await this.clearBookCache();

        return result;
    }

    /**
     * Xóa 1 cuốn sách + Tự động xóa Cache
     */
    async delete(id) {
        const result = await Book.findByIdAndDelete(id);

        // 📌 Xóa Cache cũ
        await this.clearBookCache();

        return result;
    }

    /**
     * Xóa tất cả sách + Tự động xóa Cache
     */
    async deleteAll() {
        const result = await Book.deleteMany({});

        // 📌 Xóa Cache cũ
        await this.clearBookCache();

        return result.deletedCount;
    }
}

export default BookService;