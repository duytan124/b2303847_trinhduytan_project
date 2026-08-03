import cron from "node-cron";
import Borrow from "../models/borrow.model.js";
import { sendReminderEmail } from "../services/email.service.js";

export const initReminderCronJob = () => {
    // Lên lịch chạy Cron Job vào lúc 8 giờ sáng hàng ngày
    cron.schedule("0 8 * * *", async () => {
        console.log("⏰ [CRON JOB] Đang quét các đơn mượn sách sắp đến hạn...");

        try {
            // 1. Tính toán chuẩn xác khoảng thời gian NGÀY MAI (Múi giờ địa phương)
            const now = new Date();

            const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
            const tomorrowEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 23, 59, 59, 999);

            // 2. Lọc đơn mượn thỏa điều kiện
            const upcomingBorrows = await Borrow.find({
                status: "borrowing",
                due_date: {
                    $gte: tomorrowStart,
                    $lte: tomorrowEnd,
                },
                reminder_sent: { $ne: true }, // Quét đơn chưa được gửi mail
            }).populate("user_id book_id");

            console.log(`🎯 Tìm thấy ${upcomingBorrows.length} đơn mượn hết hạn ngày mai (${tomorrowStart.toLocaleDateString("vi-VN")})`);

            // 3. Tiến hành gửi mail
            for (const borrow of upcomingBorrows) {
                const userEmail = "duytan2005hg@gmail.com";
                const userName = `${borrow.user_id?.last_name || ""} ${borrow.user_id?.first_name || ""}`.trim() || "Độc giả";
                const bookTitle = borrow.book_id?.title || "Sách mượn";
                const dueDateText = new Date(borrow.due_date).toLocaleDateString("vi-VN");

                if (userEmail) {
                    await sendReminderEmail(userEmail, userName, bookTitle, dueDateText);

                    // Cập nhật cờ vào DB
                    borrow.reminder_sent = true;
                    await borrow.save();

                    console.log(`✉️ Đã gửi email nhắc nhở tới: ${userEmail}`);
                } else {
                    console.log(`⚠️ Đơn mượn ${borrow._id} thiếu thông tin Email của người mượn!`);
                }
            }
        } catch (error) {
            console.error("❌ Lỗi khi chạy Cron Job nhắc hạn trả sách:", error);
        }
    });
};