import dotenv from "dotenv";
dotenv.config();

import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import axios from "axios";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class UserService {
    // =========================================================
    // CRUD CƠ BẢN
    // =========================================================
    async create(payload) {
        // Lọc sạch dữ liệu TRƯỚC KHIN khởi tạo Mongoose Object
        const cleanPayload = {};
        const allowedFields = [
            "username", "email", "first_name", "last_name",
            "password", "role", "birthday", "gender",
            "address", "phone", "authProvider", "google_id"
        ];

        for (const key of allowedFields) {
            if (payload[key] !== undefined && payload[key] !== null && payload[key] !== "") {
                cleanPayload[key] = payload[key];
            }
        }

        // Kiểm tra nếu mật khẩu chưa được băm thì mới băm
        if (cleanPayload.password && !cleanPayload.password.startsWith('$2b$')) {
            cleanPayload.password = await bcrypt.hash(cleanPayload.password, 12);
        }

        const user = new User(cleanPayload);
        return await user.save();
    }

    async find(filter) {
        return await User.find(filter);
    }

    async findById(id) {
        return await User.findById(id);
    }

    async findByName(name) {
        return await User.find({
            name: { $regex: new RegExp(name, "i") },
        });
    }

    async findByUsername(username) {
        return await User.findOne({ username });
    }

    async findByEmail(email) {
        return await User.findOne({ email });
    }

    async findByGoogleId(googleId) {
        return await User.findOne({ google_id: googleId });
    }

    async update(id, payload) {
        const cleanData = { ...payload };

        if (cleanData.password) {
            if (!cleanData.password.startsWith('$2b$')) {
                cleanData.password = await bcrypt.hash(cleanData.password, 12);
            }
        } else {
            delete cleanData.password;
        }

        Object.keys(cleanData).forEach(key => {
            if (cleanData[key] === undefined || cleanData[key] === "" || cleanData[key] === null) {
                delete cleanData[key];
            }
        });

        const result = await User.findByIdAndUpdate(
            id, { $set: cleanData }, { new: true }
        );

        if (!result) {
            throw new Error("User not found");
        }

        return result;
    }

    async delete(id) {
        const result = await User.findByIdAndDelete(id);

        if (!result) {
            throw new Error(`User with ID ${id} not found`);
        }
        return result;
    }

    async deleteAll() {
        const result = await User.deleteMany({});
        return result.deletedCount;
    }

    // =========================================================
    // XỬ LÝ ĐĂNG NHẬP GOOGLE OAUTH2 TẬP TRUNG
    // =========================================================
    async loginWithGoogle(token) {
        let email, googleId, firstName, lastName;

        // 1. Xác minh Token từ Google (Hỗ trợ cả ID Token và Access Token)
        try {
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            email = payload.email;
            googleId = payload.sub;
            firstName = payload.family_name || 'Google';
            lastName = payload.given_name || email.split('@')[0];
        } catch (idTokenErr) {
            try {
                const googleRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const payload = googleRes.data;
                email = payload.email;
                googleId = payload.sub;

                const nameParts = (payload.name || "Google User").trim().split(" ");
                firstName = payload.family_name || (nameParts.length > 1 ? nameParts.slice(0, -1).join(" ") : "Google");
                lastName = payload.given_name || (nameParts.length > 1 ? nameParts[nameParts.length - 1] : nameParts[0]);
            } catch (accessTokenErr) {
                throw new Error("Token Google không hợp lệ hoặc đã hết hạn");
            }
        }

        if (!email) {
            throw new Error("Không lấy được Email từ Google");
        }

        // 2. BẮT BUỘC CHỈ CHO PHÉP EMAIL SINH VIÊN CTU (@student.ctu.edu.vn) và mail thường có đuôi (@gmail.com)
        // Chuyển email về chữ thường (.toLowerCase()) để tránh lỗi gõ hoa/thường
        const cleanEmail = email.toLowerCase().trim();
        const isCTUEmail = cleanEmail.endsWith('@student.ctu.edu.vn');
        const isGmail = cleanEmail.endsWith('@gmail.com');

        if (!isCTUEmail && !isGmail) {
            throw new Error('Hệ thống chỉ hỗ trợ đăng nhập bằng Email sinh viên Đại học Cần Thơ (@student.ctu.edu.vn)');
        }

        // 3. Tìm kiếm người dùng bằng Google ID hoặc Email
        let user = await User.findOne({
            $or: [
                { google_id: googleId },
                { email: cleanEmail }
            ]
        });

        const baseUsername = cleanEmail.split('@')[0];
        if (!user) {
            user = await User.findOne({ username: baseUsername });
        }

        // 4. Nếu chưa có -> Tạo tài khoản mới
        if (!user) {
            let uniqueUsername = baseUsername;
            const existingUsername = await User.findOne({ username: uniqueUsername });
            if (existingUsername) {
                uniqueUsername = `${baseUsername}_${Math.floor(1000 + Math.random() * 9000)}`;
            }

            const randomPassword = Math.random().toString(36).slice(-8);

            user = await this.create({
                username: uniqueUsername,
                email: cleanEmail,
                first_name: firstName,
                last_name: lastName,
                password: randomPassword,
                role: "user",
                gender: false,
                authProvider: "google",
                google_id: googleId
            });
        } else if (!user.google_id) {
            // Liên kết tài khoản sẵn có với Google ID
            user.google_id = googleId;
            user.authProvider = "google";
            await user.save();
        }

        // 5. Tạo JWT Token trả về Client
        const jwtSecret = process.env.JWT_SECRET || "default_jwt_secret_key_123456";
        const userId = user._id || user.id;

        const accessToken = jwt.sign(
            { id: userId, username: user.username, role: user.role || "user" },
            jwtSecret,
            { expiresIn: "1d" }
        );

        return {
            accessToken: accessToken,
            token: accessToken,
            user: {
                _id: userId,
                id: userId,
                username: user.username,
                email: user.email,
                role: user.role || "user",
            }
        };
    }
}

export default UserService;