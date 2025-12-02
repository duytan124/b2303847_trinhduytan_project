import mongoose from "mongoose";

const borrowSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
    },
    staff_id: {
        type: mongoose.Schema.ObjectId,
        ref: "Staff",
    },
    book_id: {
        type: mongoose.Schema.ObjectId,
        ref: "Book",
    },
    borrow_date: {
        type: Date,
        default: Date.now,
        required: true,
    },
    return_date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "borrowing", "rejected", "return_pending", "returned", "overdue"],
        default: "pending",
    },
},
    {
        timestamps: true,
    }
);

const Borrow = mongoose.model("Borrow", borrowSchema);
export default Borrow;
