import cron from "node-cron";
import fineService from "../services/fine.service.js";

// Chạy tự động vào 00:00 hàng đêm
export const initFineCronJob = () => {
    cron.schedule("0 0 * * *", async () => {
        console.log("⏰ [CRON JOB] Đang quét và cập nhật tiền phạt quá hạn...");
        try {
            const count = await fineService.scanAndUpdateAllFines();
            console.log(`✅ [CRON JOB] Hoàn tất! Đã cập nhật ${count} bản ghi tiền phạt.`);
        } catch (error) {
            console.error("❌ [CRON JOB] Lỗi khi quét tiền phạt:", error);
        }
    });
};