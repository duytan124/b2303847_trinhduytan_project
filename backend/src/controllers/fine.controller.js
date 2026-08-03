import fineService from "../services/fine.service.js";
import ApiError from "../api-error.js";

/**
 * GET /api/fines/report
 * Lấy danh sách báo cáo phạt & dữ liệu Thẻ thống kê (REQ_COR_01)
 */
export async function getFineReport(req, res, next) {
    try {
        // 1. Tự động quét và cập nhật lại tiền phạt cho các phiếu mượn trễ hạn
        await fineService.scanAndUpdateAllFines();

        // 2. Lấy dữ liệu báo cáo { stats, fines }
        const reportData = await fineService.getFineReportData();

        return res.json(reportData);
    } catch (error) {
        console.error("❌ Lỗi getFineReport:", error);
        const statusCode = error.statusCode || 500;
        return next(new ApiError(statusCode, error.message || "Lỗi khi lấy báo cáo tiền phạt"));
    }
}

/**
 * GET /api/fines/:id
 * Lấy chi tiết 1 bản ghi Fine (Phục vụ việc Polling kiểm tra trạng thái ở Frontend)
 */
export async function getFineById(req, res, next) {
    try {
        const fine = await fineService.getFineById(req.params.id);
        if (!fine) {
            return next(new ApiError(404, "Không tìm thấy khoản phạt"));
        }
        return res.json(fine);
    } catch (error) {
        console.error("❌ Lỗi getFineById:", error);
        const statusCode = error.statusCode || 500;
        return next(new ApiError(statusCode, error.message || "Lỗi khi kiểm tra khoản phạt"));
    }
}

/**
 * POST /api/fines/trigger-scan
 * Quét phạt thủ công (Dùng cho Dev / Test)
 */
export async function triggerScanFines(req, res, next) {
    try {
        const count = await fineService.scanAndUpdateAllFines();
        return res.json({ message: `Đã cập nhật tiền phạt cho ${count} phiếu mượn` });
    } catch (error) {
        console.error("❌ Lỗi triggerScanFines:", error);
        const statusCode = error.statusCode || 500;
        return next(new ApiError(statusCode, error.message || "Lỗi khi quét tiền phạt"));
    }
}

/**
 * POST /api/fines/webhook/sepay
 * Nhận Webhook tự động gạch nợ từ SePay / Casso (REQ_ADA_02)
 */
export async function handleSepayWebhook(req, res, next) {
    try {
        // 1. Kiểm tra API Key bảo mật từ Header
        const authHeader = req.headers["authorization"] || req.headers["x-sepay-api-key"];
        const expectedKey = process.env.SEPAY_API_KEY ? `Apikey ${process.env.SEPAY_API_KEY}` : null;

        if (expectedKey && authHeader !== expectedKey && authHeader !== process.env.SEPAY_API_KEY) {
            console.warn("⚠️ [Webhook Error]: Authorization Key không hợp lệ!");
            return next(new ApiError(401, "Webhook Unauthorized: API Key không chính xác"));
        }

        const { content, transferAmount, referenceCode } = req.body;
        console.log(`📥 [Webhook Sepay Received]: Content = "${content}" | Amount = ${transferAmount}`);

        // 2. Trích xuất borrow_id bằng Regex (Cú pháp: NOPHAT <24_ky_tu_mongodb_id>)
        const match = content ? content.match(/NOPHAT\s*([a-fA-F0-9]{24})/i) : null;

        if (!match || !match[1]) {
            return res.status(200).json({
                status: "ignored",
                message: "Bỏ qua: Nội dung không chứa cú pháp NOPHAT <borrow_id>"
            });
        }

        const borrowId = match[1];

        // 3. Gọi Service gạch nợ phạt và chuyển trạng thái phiếu mượn sang 'return_pending'
        const result = await fineService.processWebhookPayment(borrowId, {
            transferAmount,
            referenceCode
        });

        return res.status(200).json({
            status: "success",
            message: "Gạch nợ thành công",
            data: result
        });

    } catch (error) {
        console.error("❌ Lỗi handleSepayWebhook:", error);
        const statusCode = error.statusCode || 500;
        return next(new ApiError(statusCode, error.message || "Lỗi khi xử lý Webhook gạch nợ"));
    }
}