import BorrowService from "../services/borrow.service.js";
import ApiError from "../api-error.js";

const borrowService = new BorrowService();

export async function create(req, res, next) {
    if (!req.body?.user_id || !req.body?.book_id || !req.body?.due_date) {
        return next(new ApiError(400, "User, book information or due date is missing"));
    }

    try {
        const existingBorrow = await borrowService.find({
            user_id: req.body.user_id,
            book_id: req.body.book_id,
            status: {
                $in: ["pending", "borrowing"]
            }
        });

        const totalBorrow = await borrowService.find({
            user_id: req.body.user_id,
            status: {
                $in: ["pending", "borrowing"]
            }
        });

        if (existingBorrow.length >= 1) {
            return next(new ApiError(422, "Borrowing record for each book is limited to 1"));
        }

        if (totalBorrow.length >= 3) {
            return next(new ApiError(409, "Borrowing record is limited to 3"));
        }

        const document = await borrowService.create(req.body);
        return res.status(201).json({ message: "Book borrowing record created successfully", document });
    } catch (error) {
        console.error("Lỗi khi tạo phiếu mượn:", error);
        return next(new ApiError(500, "An error occurred while creating the book borrowing record"));
    }
}

export async function findAll(req, res, next) {
    try {
        const documents = await borrowService.find({});
        return res.json(documents);
    } catch (error) {
        console.error("Lỗi khi lấy danh sách mượn:", error);
        return next(new ApiError(500, "An error occurred while retrieving the list of book borrowing records"));
    }
}

export async function findOne(req, res, next) {
    try {
        const document = await borrowService.findById(req.params.id);

        if (!document) {
            return next(new ApiError(404, "Book borrowing record not found"));
        }

        return res.json(document);
    } catch (error) {
        console.error("Lỗi khi lấy thông tin phiếu mượn:", error);
        return next(
            new ApiError(500, `Error while retrieving book borrowing record with id ${req.params.id}`)
        );
    }
}

export async function update(req, res, next) {
    if (Object.keys(req.body).length === 0) {
        return next(new ApiError(400, "Data to update cannot be empty"));
    }

    try {
        // 🛑 RÀNG BUỘC: Nếu cố tình đổi trạng thái thành "returned", điều hướng qua logic Trả sách bắt buộc nộp phạt
        if (req.body.status === "returned") {
            const result = await borrowService.returnBook(req.params.id);
            return res.json({
                message: "Book returned successfully",
                document: result.borrow
            });
        }

        const document = await borrowService.update(req.params.id, req.body);

        if (!document) {
            return next(new ApiError(404, "Book borrowing record not found"));
        }

        return res.json({ message: "Book borrowing record updated successfully", document });
    } catch (error) {
        // Bắt lỗi 402: Chưa thanh toán tiền phạt
        if (error.statusCode === 402) {
            return res.status(402).json({
                message: error.message,
                require_payment: true,
                fine: error.fine
            });
        }
        console.error("Lỗi khi cập nhật phiếu mượn:", error);
        return next(new ApiError(500, `Error while updating book borrowing record with id ${req.params.id}`));
    }
}

// 📌 API Trả sách riêng biệt (Dùng khi Độc giả/Thủ thư ấn nút "Trả sách")
export async function returnBook(req, res, next) {
    try {
        const result = await borrowService.returnBook(req.params.id);
        return res.json({
            message: "Book returned successfully",
            document: result.borrow
        });
    } catch (error) {
        // Bắt lỗi 402: Chưa thanh toán tiền phạt
        if (error.statusCode === 402) {
            return res.status(402).json({
                message: error.message,
                require_payment: true,
                fine: error.fine
            });
        }
        console.error("Lỗi khi trả sách:", error);
        return next(new ApiError(500, "An error occurred while returning the book"));
    }
}

export async function deleteOne(req, res, next) {
    try {
        const document = await borrowService.delete(req.params.id);

        if (!document) {
            return next(new ApiError(404, "Book borrowing record not found"));
        }

        return res.send({ message: "Book borrowing record deleted successfully" });
    } catch (error) {
        console.error("Lỗi khi xóa phiếu mượn:", error);
        return next(new ApiError(500, `Could not delete book borrowing record with id ${req.params.id}`));
    }
}

export async function deleteAll(req, res, next) {
    try {
        const deletedCount = await borrowService.deleteAll();

        return res.json({
            message: `${deletedCount} records were deleted successfully`
        });
    } catch (error) {
        console.error("Lỗi khi xóa toàn bộ phiếu mượn:", error);
        return next(new ApiError(500, "An error occurred while deleting all book borrowing records"));
    }
}

// 📌 API Lấy báo cáo tiền phạt quá hạn (Ủy quyền cho borrowService xử lý)
export async function getFineReport(req, res, next) {
    try {
        const fineReport = await borrowService.getFineReport();
        return res.json(fineReport);
    } catch (error) {
        console.error("Lỗi khi lấy báo cáo tiền phạt:", error);
        return next(new ApiError(500, "An error occurred while generating the fine report"));
    }
}

export default {
    create,
    findAll,
    findOne,
    update,
    returnBook,
    deleteOne,
    deleteAll,
    getFineReport
};