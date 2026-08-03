import mongoose from "mongoose";

const fineSchema = new mongoose.Schema(
    {
        borrow_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Borrow",
            required: true,
        },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        overdue_days: {
            type: Number,
            required: true,
            default: 0,
        },
        amount: {
            type: Number,
            required: true,
            default: 0,
        },
        status: {
            type: String,
            enum: ["unpaid", "paid"],
            default: "unpaid",
        },
        paid_at: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true, // Tự động tạo createdAt và updatedAt
    }
);

const Fine = mongoose.model("Fine", fineSchema);
export default Fine;