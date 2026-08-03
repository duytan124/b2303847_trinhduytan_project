import mongoose from "mongoose";

const borrowSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    staff_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff",
        default: null
    },
    book_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
        required: true
    },
    borrow_date: { type: Date, default: Date.now },
    return_date: { type: Date, default: null },
    due_date: { type: Date, required: true },
    status: { type: String, default: "pending" },
    reminder_sent: { type: Boolean, default: false }
}, { timestamps: true });

const Borrow = mongoose.model("Borrow", borrowSchema);
export default Borrow;