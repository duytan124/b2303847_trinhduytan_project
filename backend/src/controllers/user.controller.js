import UserService from "../services/user.service.js";
import ApiError from "../api-error.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userService = new UserService();

export async function create(req, res, next) {
    if (!req.body?.username || !req.body?.password) {
        return next(new ApiError(400, "Username or password cannot be empty"));
    }
    try {
        const existingUser = await userService.findByUsername(req.body.username);
        if (existingUser) {
            return next(new ApiError(409, "Username already exists"));
        }

        await userService.create(req.body);

        return res.status(201).json({ message: "User record created successfully" });
    } catch (error) {
        console.error("❌ Error create user:", error);
        return next(new ApiError(500, error.message || "Error while creating user record"));
    }
}

export async function findAll(req, res, next) {
    let documents = [];
    try {
        const { name } = req.query;
        if (name) {
            documents = await userService.findByName(name);
        } else {
            documents = await userService.find({});
        }
        return res.json(documents);
    } catch (error) {
        console.error("❌ Error findAll:", error);
        return next(new ApiError(500, "An error occurred while retrieving the list of user records"));
    }
}

export async function findOne(req, res, next) {
    try {
        const document = await userService.findById(req.params.id);
        if (!document) {
            return next(new ApiError(404, "User record not found"));
        }
        return res.json(document);
    } catch (error) {
        console.error("❌ Error findOne:", error);
        return next(new ApiError(500, `Error retrieving user record with id ${req.params.id}`));
    }
}

export async function update(req, res, next) {
    if (!req.body || Object.keys(req.body).length === 0) {
        return next(new ApiError(400, "Data to update cannot be empty"));
    }

    try {
        if (req.body.username) {
            const existingUser = await userService.findByUsername(req.body.username);
            if (existingUser && (existingUser._id || existingUser.id).toString() !== req.params.id) {
                return next(new ApiError(409, "Username already exists"));
            }
        }

        const document = await userService.update(req.params.id, req.body);
        if (!document) {
            return next(new ApiError(404, "User record not found"));
        }
        return res.json({ message: "User record updated successfully" });
    } catch (error) {
        console.error("❌ Error update:", error);
        return next(new ApiError(500, error.message || `Error updating user record with id ${req.params.id}`));
    }
}

export async function deleteOne(req, res, next) {
    try {
        const document = await userService.delete(req.params.id);
        if (!document) {
            return next(new ApiError(404, "User record not found"));
        }
        return res.send({ message: "User record deleted successfully" });
    } catch (error) {
        console.error("❌ Error deleteOne:", error);
        return next(new ApiError(500, `Could not delete user record with id ${req.params.id}`));
    }
}

export async function deleteAll(req, res, next) {
    try {
        const deleteCount = await userService.deleteAll();
        return res.send({
            message: `${deleteCount} user records were deleted successfully`,
        });
    } catch (error) {
        console.error("❌ Error deleteAll:", error);
        return next(new ApiError(500, "An error occurred while deleting all user records"));
    }
}

export async function login(req, res, next) {
    if (!req.body?.username || !req.body?.password) {
        return next(new ApiError(400, "Username or password cannot be empty"));
    }

    try {
        const user = await userService.findByUsername(req.body.username);
        if (!user) {
            return next(new ApiError(404, "User not found"));
        }

        const passwordIsMatch = await bcrypt.compare(req.body.password, user.password);
        if (!passwordIsMatch) {
            return next(new ApiError(401, "Invalid password"));
        }

        const jwtSecret = process.env.JWT_SECRET || "default_jwt_secret_key_123456";
        const token = jwt.sign(
            { id: user._id || user.id, username: user.username, role: user.role },
            jwtSecret,
            { expiresIn: "1h" }
        );

        return res.status(200).send({
            token,
            accessToken: token,
            user: {
                id: user._id || user.id,
                _id: user._id || user.id,
                username: user.username,
                role: user.role,
            }
        });
    } catch (error) {
        console.error("❌ Error login:", error);
        return next(new ApiError(500, "An error occurred while login"));
    }
}

// =========================================================
// ĐĂNG NHẬP GOOGLE OAUTH2
// =========================================================
export async function googleLogin(req, res, next) {
    try {
        // Tự động nhận diện token dù Frontend gửi tên biến nào
        const token = req.body?.token || req.body?.accessToken || req.body?.idToken || req.body?.credential;

        if (!token) {
            return next(new ApiError(400, "Thiếu Google Token"));
        }

        const result = await userService.loginWithGoogle(token);
        return res.status(200).json(result);

    } catch (error) {
        console.error("❌ CRASH GOOGLE LOGIN BACKEND:", error.message || error);
        return next(new ApiError(500, error.message || "Lỗi hệ thống khi đăng nhập Google"));
    }
}

export default {
    create, findAll, findOne, update, deleteOne, deleteAll, login, googleLogin
};