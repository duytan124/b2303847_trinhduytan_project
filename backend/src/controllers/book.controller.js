import BookService from "../services/book.service.js";
import ApiError from "../api-error.js";
import redisClient from "../config/redis.js"; // [THÊM MỚI] Import Redis

const bookService = new BookService();

// [THÊM MỚI] Hàm hỗ trợ xóa tất cả cache liên quan đến tìm kiếm sách
const clearBookCache = async () => {
    try {
        const keys = await redisClient.keys('books:search:*');
        if (keys.length > 0) {
            await redisClient.del(keys);
        }
    } catch (error) {
        console.error('Lỗi xoá cache Redis:', error);
    }
};

export async function create(req, res, next) {
    if (!req.body?.title) {
        return next(new ApiError(400, "Book title cannot be empty"));
    }

    try {
        const document = await bookService.create(req.body);

        await clearBookCache(); // [THÊM MỚI] Xóa cache khi dữ liệu thay đổi

        // Đã gộp document vào chung object trả về
        return res.status(201).json({ message: "Book created successfully", data: document });
    } catch (error) {
        console.log(error);
        return next(new ApiError(500, "Error while creating book"));
    }
}

export async function findAll(req, res, next) {
    let documents = [];

    try {
        const { title } = req.query;
        if (title) {
            documents = await bookService.findByName(title);
        } else {
            documents = await bookService.find({});
        }

        // ⚡ [SỬA LẠI] Kiểm tra cờ isOpen và bọc try-catch riêng cho việc lưu Cache
        if (req.cacheKey && redisClient.isOpen) {
            try {
                await redisClient.setEx(req.cacheKey, 3600, JSON.stringify(documents));
            } catch (cacheError) {
                // Chỉ in cảnh báo ra console, KHÔNG ngắt luồng trả dữ liệu về Frontend
                console.warn("⚠️ Ghi Redis Cache thất bại:", cacheError.message);
            }
        }

    } catch (error) {
        console.log(error);
        return next(
            new ApiError(500, "An error occurred while retrieving the list of books")
        );
    }
    return res.json(documents);
}

export async function findOne(req, res, next) {
    try {
        const document = await bookService.findById(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Book not found"));
        }
        return res.json(document);
    } catch (error) {
        console.log(error);
        return next(
            new ApiError(500, `Error while retrieving book with id ${req.params.id}`)
        );
    }
}

export async function update(req, res, next) {
    if (Object.keys(req.body).length === 0) {
        return next(new ApiError(400, "Data to update cannot be empty"));
    }

    try {
        const document = await bookService.update(req.params.id, req.body);

        if (!document) {
            return next(new ApiError(404, "Book not found"));
        }

        await clearBookCache(); // [THÊM MỚI] Xóa cache khi dữ liệu thay đổi

        return res.send({ message: "Book updated successfully", data: document });
    } catch (error) {
        console.log(error);
        return next(
            new ApiError(500, `Error while updating book with id ${req.params.id}`)
        );
    }
}

export async function deleteOne(req, res, next) {
    try {
        const document = await bookService.delete(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Book not found"));
        }

        await clearBookCache(); // [THÊM MỚI] Xóa cache khi dữ liệu thay đổi

        return res.json({ message: "Book deleted successfully" });
    } catch (error) {
        console.log(error);
        return next(
            new ApiError(500, `Could not delete book with id ${req.params.id}`)
        );
    }
}

export async function deleteAll(req, res, next) {
    try {
        const deleteCount = await bookService.deleteAll();

        await clearBookCache(); // [THÊM MỚI] Xóa cache khi dữ liệu thay đổi

        return res.json({
            message: `${deleteCount} books were deleted successfully`
        });
    } catch (error) {
        console.log(error);
        return next(
            new ApiError(500, "An error occurred while deleting all books")
        );
    }
}

export default {
    create, findAll, findOne, update, deleteOne, deleteAll,
};