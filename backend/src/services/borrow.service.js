import Borrow from "../models/borrow.model.js";
import Fine from "../models/fine.model.js";

class BorrowService {

    // --- CÁC PHƯƠNG THỨC CRUD ---

    async create(payload) {
        try {
            // 1. Tự động tính hạn trả (ví dụ: 14 ngày nếu Frontend không truyền due_date)
            const borrowDate = payload.borrow_date ? new Date(payload.borrow_date) : new Date();
            let dueDate = payload.due_date ? new Date(payload.due_date) : null;

            if (!dueDate) {
                dueDate = new Date(borrowDate);
                dueDate.setDate(dueDate.getDate() + 14); // Mặc định cho mượn 14 ngày
            }

            // 2. Lọc sạch payload trước khi tạo Document
            const cleanData = {
                user_id: payload.user_id,
                book_id: payload.book_id,
                borrow_date: borrowDate,
                due_date: dueDate,
                status: payload.status || "pending"
            };

            if (payload.staff_id) cleanData.staff_id = payload.staff_id;

            // 3. Khởi tạo và Lưu trực tiếp
            const borrow = new Borrow(cleanData);
            const savedBorrow = await borrow.save();

            return savedBorrow;
        } catch (error) {
            console.error("Lỗi khi tạo phiếu mượn tại Service:", error);
            throw error;
        }
    }

    // Ghép dữ liệu Fine thủ công để tránh lỗi 500 StrictPopulateError
    async find(filter) {
        const borrows = await Borrow.find(filter)
            .populate("user_id")
            .populate({
                path: "book_id",
                populate: {
                    path: "publisher_id",
                    model: "Publisher"
                }
            })
            .populate({
                path: "staff_id",
                model: "Staff"
            })
            .lean();

        // Lấy tất cả các khoản phạt tương ứng với danh sách phiếu mượn
        const borrowIds = borrows.map(b => b._id);
        const fines = await Fine.find({ borrow_id: { $in: borrowIds } }).lean();

        const fineMap = {};
        fines.forEach(fine => {
            fineMap[fine.borrow_id.toString()] = fine;
        });

        // Tự động gán object fine_id vào từng đơn mượn cho Frontend dễ đọc
        return borrows.map(borrow => ({
            ...borrow,
            fine_id: fineMap[borrow._id.toString()] || null
        }));
    }

    async findById(id) {
        const borrow = await Borrow.findById(id)
            .populate("user_id")
            .populate({
                path: "book_id",
                populate: {
                    path: "publisher_id",
                    model: "Publisher"
                }
            })
            .populate({
                path: "staff_id",
                model: "Staff"
            })
            .lean();

        if (!borrow) return null;

        const fine = await Fine.findOne({ borrow_id: id }).lean();
        borrow.fine_id = fine || null;

        return borrow;
    }

    async findByUserId(user_id) {
        const borrows = await Borrow.find({ user_id: user_id })
            .populate("user_id")
            .populate("book_id")
            .lean();

        const borrowIds = borrows.map(b => b._id);
        const fines = await Fine.find({ borrow_id: { $in: borrowIds } }).lean();

        const fineMap = {};
        fines.forEach(fine => {
            fineMap[fine.borrow_id.toString()] = fine;
        });

        return borrows.map(borrow => ({
            ...borrow,
            fine_id: fineMap[borrow._id.toString()] || null
        }));
    }

    async update(id, payload) {
        Object.keys(payload).forEach(key => {
            if (payload[key] === undefined || payload[key] === "" || payload[key] === null) {
                delete payload[key];
            }
        });

        return await Borrow.findByIdAndUpdate(
            id,
            { $set: payload },
            {
                new: true,
                runValidators: true
            }
        );
    }

    async delete(id) {
        return await Borrow.findByIdAndDelete(id);
    }

    async deleteAll() {
        const result = await Borrow.deleteMany({});
        return result.deletedCount;
    }

    // =========================================================================
    // --- TÍNH NĂNG MỚI & TÍNH PHẠT (REQ_COR_01, REQ_ADA_02 & REQ_PER_03) ---
    // =========================================================================

    /**
     * [REQ_COR_01] Tính tiền phạt trễ hạn theo ngày lịch liên tục
     * Đơn giá: 5.000 VNĐ / ngày trễ
     */
    async calculateFine(dueDate, returnDate) {
        const FINE_PER_DAY = 5000;

        const start = new Date(dueDate);
        start.setHours(0, 0, 0, 0);

        const end = returnDate ? new Date(returnDate) : new Date();
        end.setHours(0, 0, 0, 0);

        if (end <= start) {
            return { lateDays: 0, fineAmount: 0 };
        }

        const diffTime = end.getTime() - start.getTime();
        const lateDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        return {
            lateDays,
            fineAmount: lateDays * FINE_PER_DAY
        };
    }

    /**
     * [REQ_COR_01 & REQ_ADA_02] Xử lý trả sách
     * BẮT BUỘC phải thanh toán xong tiền phạt mới cho đổi status sang 'returned'
     */
    async returnBook(id) {
        const borrow = await Borrow.findById(id);
        if (!borrow) {
            throw new Error("Không tìm thấy phiếu mượn");
        }

        const returnDate = new Date();
        const dueDate = borrow.due_date;

        // 1. Tính toán phạt
        const { lateDays, fineAmount } = await this.calculateFine(dueDate, returnDate);

        // 2. Nếu CÓ TIỀN PHẠT (> 0)
        if (fineAmount > 0) {
            let fineRecord = await Fine.findOne({ borrow_id: borrow._id });

            // Tự động tạo bản ghi phạt nếu chưa có
            if (!fineRecord) {
                fineRecord = await Fine.create({
                    borrow_id: borrow._id,
                    user_id: borrow.user_id,
                    fine_amount: fineAmount,
                    late_days: lateDays,
                    status: "unpaid"
                });
            } else {
                const isUnpaid = fineRecord.status === "unpaid" || fineRecord.payment_status === "unpaid";
                if (isUnpaid) {
                    fineRecord.fine_amount = fineAmount;
                    fineRecord.late_days = lateDays;
                    await fineRecord.save();
                }
            }

            // Kiểm tra linh hoạt cả 2 trường status hoặc payment_status
            const currentStatus = fineRecord.status || fineRecord.payment_status;

            // 🛑 CHẶN NẾU CHƯA ĐƯỢC GẠCH NỢ
            if (currentStatus !== "paid") {
                const error = new Error("Phiếu mượn quá hạn. Vui lòng thanh toán tiền phạt trước khi trả sách.");
                error.statusCode = 402;
                error.fine = fineRecord;
                throw error;
            }
        }

        // 3. Nếu KHÔNG BỊ PHẠT hoặc ĐÃ THANH TOÁN (status === 'paid')
        borrow.return_date = returnDate;
        borrow.status = "returned";
        await borrow.save();

        return { borrow, message: "Trả sách thành công" };
    }

    /**
     * [REQ_COR_01] Lấy danh sách báo cáo tiền phạt
     */
    async getFineReport() {
        return await Fine.find({})
            .populate("user_id", "username email first_name last_name")
            .populate({
                path: "borrow_id",
                populate: { path: "book_id", select: "title" }
            })
            .sort({ createdAt: -1 });
    }

    /**
     * [REQ_PER_03] Lấy danh sách các phiếu mượn đến hạn trả vào ngày mai
     */
    async findDueTomorrow() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        const nextDay = new Date(tomorrow);
        nextDay.setHours(23, 59, 59, 999);

        return await Borrow.find({
            due_date: { $gte: tomorrow, $lte: nextDay },
            return_date: null,
            status: { $in: ["borrowed", "pending", "approved"] }
        })
            .populate("user_id")
            .populate("book_id");
    }
}

export default BorrowService;