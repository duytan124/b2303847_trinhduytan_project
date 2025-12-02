import mongoose from "mongoose";

const publisherSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    phone: {
        type: String,
        required: true,
        trim: true,
    },
    address: {
        type: String,
        required: true,
        trim: true,
    },
},
    {
        timestamps: true,
    }
);

const Publisher = mongoose.model("Publisher", publisherSchema);
export default Publisher;