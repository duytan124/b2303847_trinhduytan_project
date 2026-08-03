import express from "express";
import {
    getFineReport,
    getFineById,
    triggerScanFines,
    handleSepayWebhook // 👈 1. Thêm import hàm xử lý Webhook
} from "../controllers/fine.controller.js";

const router = express.Router();

// [REQ_COR_01] Lấy báo cáo phạt & stats
router.get("/report", getFineReport);

// Trigger quét phạt thủ công
router.post("/trigger-scan", triggerScanFines);

// ⚡ [REQ_ADA_02] Webhook nhận dữ liệu gạch nợ tự động từ Sepay / Postman
router.post("/webhook/sepay", handleSepayWebhook); // 👈 2. Khai báo Route Webhook (POST)

export default router;