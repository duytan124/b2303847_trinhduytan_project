import UserService from "../services/user.service.js";
import ApiError from "../api-error.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

const userService = new UserService();
dotenv.config();

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
        console.log(error);
        return next(new ApiError(500, "Error while creating user record"));
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
    } catch (error) {
        console.log(error);
        return next(new ApiError(500, "An error occurred while retrieving the list of user records"));
    }
    return res.json(documents);
}

export async function findOne(req, res, next) {
    try {
        const document = await userService.findById(req.params.id);
        if (!document) {
            return next(new ApiError(404, "User record not found"));
        }
        return res.json(document);
    } catch (error) {
        console.log(error);
        return next(new ApiError(500, `Error retrieving user record with id ${req.params.id}`));
    }
}

export async function update(req, res, next) {
    if (Object.keys(req.body).length === 0) {
        return next(new ApiError(400, "Data to update cannot be empty"));
    }

    try {
        const existingUser = await userService.findByUsername(req.body.username);
        if (existingUser) {
            return next(new ApiError(409, "Username already exists"));
        }

        const document = await userService.update(req.params.id, req.body);
        if (!document) {
            return next(new ApiError(404, "User record not found"));
        }
        return res.json({ message: "User record updated successfully" });
    } catch (error) {
        console.log(error);
        return next(new ApiError(500, `Error updating user record with id ${req.params.id}`));
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
        console.log(error);
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
        console.log(error);
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

        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        return res.status(200).send({
            token,
            user: {
                id: user._id,
                username: user.username,
                role: user.role,
            }
        });
    } catch (error) {
        console.log(error);
        return next(new ApiError(500, "An error occurred while login"));
    }
}

export default {
    create, findAll, findOne, update, deleteOne, deleteAll, login,
};