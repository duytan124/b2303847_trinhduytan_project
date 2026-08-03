import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    genre: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 0 },
    published_year: { type: Number, required: true },
    publisher_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Publisher",
        required: true
    },
    author: { type: String, required: true, trim: true }
}, { timestamps: true });

const Book = mongoose.model("Book", bookSchema);
export default Book;