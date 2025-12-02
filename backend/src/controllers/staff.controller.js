import StaffService from "../services/staff.service.js";
import ApiError from "../api-error.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

const staffService = new StaffService();
dotenv.config();

export async function create(req, res, next) {
    if (!req.body?.username || !req.body?.password) {
        return next(new ApiError(400, "Username or password cannot be empty"));
    }
    try {
        const existingStaff = await staffService.findByUsername(req.body.username);
        if (existingStaff) {
            return next(new ApiError(409, "Username already exists"));
        }

        await staffService.create(req.body);

        return res.status(201).json({ message: "Staff record created successfully" });
    } catch (error) {
        console.log(error);
        return next(new ApiError(500, "Error creating the staff record"));
    }
}

export async function findAll(req, res, next) {
    let documents = [];
    try {
        const { name } = req.query;
        if (name) {
            documents = await staffService.findByName(name);
        } else {
            documents = await staffService.find({});
        }
    } catch (error) {
        console.log(error);
        return next(new ApiError(500, "An error occurred while retrieving the list of staff records"));
    }
    return res.json(documents);
}

export async function findOne(req, res, next) {
    try {
        const document = await staffService.findById(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Staff record not found"));
        }
        return res.json(document);
    } catch (error) {
        console.log(error);
        return next(new ApiError(500, `Error retrieving staff record with id ${req.params.id}`));
    }
}

export async function update(req, res, next) {
    if (Object.keys(req.body).length === 0) {
        return next(new ApiError(400, "Data to update cannot be empty"));
    }

    try {
        const existingStaff = await staffService.findByUsername(req.body.username);
        if (existingStaff) {
            return next(new ApiError(409, "Username already exists"));
        }
        
        const document = await staffService.update(req.params.id, req.body);
        if (!document) {
            return next(new ApiError(404, "Staff record not found"));
        }

        return res.json({ message: "Staff record updated successfully", document });
    } catch (error) {
        console.log(error);
        return next(new ApiError(500, `Error updating staff record with id ${req.params.id}`));
    }
}

export async function deleteOne(req, res, next) {
    try {
        const document = await staffService.delete(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Staff record not found"));
        }
        return res.send({ message: "Staff record deleted successfully" });
    } catch (error) {
        console.log(error);
        return next(new ApiError(500, `Could not delete staff record with id ${req.params.id}`));
    }
}

export async function deleteAll(req, res, next) {
    try {
        const deleteCount = await staffService.deleteAll();
        return res.send({
            message: `${deleteCount} staff records were deleted successfully`,
        });
    } catch (error) {
        console.log(error);
        return next(new ApiError(500, "An error occurred while deleting all staff records"));
    }
}

export async function login(req, res, next) {
    if (!req.body?.username || !req.body?.password) {
        return next(new ApiError(400, "Username and password cannot be empty"));
    }

    try {
        const staff = await staffService.findByUsername(req.body.username);
        if (!staff) {
            return next(new ApiError(404, "Staff not found"));
        }

        const passwordIsMatch = await bcrypt.compare(req.body.password, staff.password);

        if (!passwordIsMatch) {
            return next(new ApiError(401, "Invalid password"));
        }

        const token = jwt.sign(
            { id: staff._id, username: staff.username },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        return res.status(200).send({
            token,
            staff: {
                id: staff._id,
                username: staff.username,
                role: staff.role
            }
        });
    } catch (error) {
        console.log(error);
        return next(new ApiError(500, "Error during login"));
    }
}

export default {
    create, findAll, findOne, update, deleteOne, deleteAll, login,
};