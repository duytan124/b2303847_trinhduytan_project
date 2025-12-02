import mongoose from "mongoose";

const staffSchema = mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
        trim: true,
    },
    phone: {
        type: String,
        required: true,
        trim: true,
    },
    role: {
        type: String,
        default: "staff",
    },
},
    {
        timestamps: true,
    }
);

const Staff = mongoose.model("Staff", staffSchema);
export default Staff;