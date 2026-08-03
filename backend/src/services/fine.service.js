import Fine from "../models/fine.model.js";
import Borrow from "../models/borrow.model.js";
import ApiError from "../api-error.js";

class FineService {
    // Mức phạt cố định: 5.000 VNĐ / 1 ngày quá hạn
    FINE_PER_DAY = 5000;

    /**
     * 1. Quét và tự động tạo/cập nhật tiền phạt cho các phiếu mượn trễ hạn
     */
    async scanAndUpdateAllFines() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Tìm tất cả các phiếu mượn chưa trả có due_date < ngày hiện tại
        const overdueBorrows = await Borrow.find({
            status: { $in: ["borrowing", "overdue"] },
            due_date: { $lt: today }
        });

        let updatedCount = 0;

        for (const borrow of overdueBorrows) {
            const dueDate = new Date(borrow.due_date);
            dueDate.setHours(0, 0, 0, 0);

            // Tính số ngày quá hạn
            const diffTime = Math.abs(today - dueDate);
            const lateDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (lateDays > 0) {
                const fineAmount = lateDays * this.FINE_PER_DAY;

                let fine = await Fine.findOne({ borrow_id: borrow._id });

                if (!fine) {
                    fine = new Fine({
                        borrow_id: borrow._id,
                        user_id: borrow.user_id,
                        late_days: lateDays,
                        overdue_days: lateDays,
                        fine_amount: fineAmount,
                        amount: fineAmount,
                        status: "unpaid"
                    });
                } else if (fine.status === "unpaid") {
                    fine.late_days = lateDays;
                    fine.overdue_days = lateDays;
                    fine.fine_amount = fineAmount;
                    fine.amount = fineAmount;
                }

                await fine.save();

                // Cập nhật trạng thái phiếu mượn
                borrow.status = "overdue";
                borrow.fine_id = fine._id;
                await borrow.save();

                updatedCount++;
            }
        }

        return updatedCount;
    }

    /**
     * 2. Lấy dữ liệu báo cáo danh sách khoản phạt & thống kê
     */
    async getFineReportData() {
        const allFines = await Fine.find()
            .populate("user_id", "first_name last_name email phone")
            .populate({
                path: "borrow_id",
                populate: { path: "book_id", select: "title" }
            })
            .sort({ createdAt: -1 });

        // Thống kê tổng quan
        const stats = allFines.reduce(
            (acc, fine) => {
                const amt = fine.fine_amount ?? fine.amount ?? 0;

                if (fine.status === "paid") {
                    acc.totalPaidAmount += amt;
                    acc.paidCount += 1;
                } else {
                    acc.totalUnpaidAmount += amt;
                    acc.unpaidCount += 1;
                }
                return acc;
            },
            { totalPaidAmount: 0, totalUnpaidAmount: 0, paidCount: 0, unpaidCount: 0 }
        );

        // Lọc danh sách phạt chưa thanh toán
        const unpaidFines = allFines.filter(fine => fine.status === "unpaid");

        return {
            stats,
            fines: unpaidFines
        };
    }

    /**
     * 3. Lấy thông tin 1 khoản phạt theo ID
     */
    async getFineById(fineId) {
        return await Fine.findById(fineId);
    }

    /**
     * 4. Xử lý gạch nợ TỰ ĐỘNG thông qua Webhook (SePay / Postman)
     */
    async processWebhookPayment(borrowId, transactionData = {}) {
        // 1. Kiểm tra sự tồn tại của phiếu mượn
        const borrow = await Borrow.findById(borrowId);
        if (!borrow) {
            throw new ApiError(404, `Không tìm thấy phiếu mượn với ID: ${borrowId}`);
        }

        // 2. Tìm khoản phạt gắn với phiếu mượn
        let fine = await Fine.findOne({ borrow_id: borrowId });

        if (!fine) {
            fine = new Fine({
                borrow_id: borrow._id,
                user_id: borrow.user_id,
                fine_amount: transactionData.transferAmount || 0,
                amount: transactionData.transferAmount || 0,
                status: "paid",
                paid_at: new Date(),
                transaction_ref: transactionData.referenceCode || "SEPAY_WEBHOOK"
            });
        } else {
            fine.status = "paid";
            fine.paid_at = new Date();
            if (transactionData.referenceCode) {
                fine.transaction_ref = transactionData.referenceCode;
            }
        }
        await fine.save();

        // 3. Cập nhật phiếu mượn sang trạng thái 'return_pending' (Chờ duyệt trả)
        borrow.status = "return_pending";
        borrow.fine_id = fine._id;
        await borrow.save();

        console.log(`✅ [Webhook Success]: Đã gạch nợ cho Borrow ID ${borrowId}, đổi trạng thái sang 'return_pending'`);

        return { fine, borrow };
    }
}

export default new FineService();