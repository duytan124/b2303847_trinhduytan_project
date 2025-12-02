import mongoose from "mongoose";

const bookSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    genre: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    published_year: {
        type: Number,
        required: true,
    },
    publisher_id: {
        type: mongoose.Schema.ObjectId,
        ref: "Publisher",
    },
    author: {
        type: String,
        required: true,
    },
},
    {
        timestamps: true,
    }
);

const Book = mongoose.model("Book", bookSchema);
export default Book;