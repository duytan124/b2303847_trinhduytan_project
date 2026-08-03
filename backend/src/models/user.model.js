import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    first_name: { type: String, required: true, trim: true },
    last_name: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true },
    password: {
        type: String,
        required: function () { return this.authProvider === 'local'; }
    },
    birthday: { type: Date, required: false },
    gender: { type: Boolean, default: true },
    address: { type: String, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    role: { type: String, default: "user" },
    authProvider: { type: String, default: "local" },
    google_id: { type: String, default: null }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;