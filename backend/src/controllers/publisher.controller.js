import PublisherService from "../services/publisher.service.js";
import ApiError from "../api-error.js";

const publisherService = new PublisherService();

export async function create(req, res, next) {
    if (!req.body?.name) {
        return next(new ApiError(400, "Publisher name cannot be empty"));
    }
    try {
        const document = await publisherService.create(req.body);
        return res.json({ message: "Publisher created successfully" }, document);
    } catch (error) {
        console.log(error);
        return next(new ApiError(500, "Error creating the publisher"));
    }
}

export async function findOne(req, res, next) {
    try {
        const document = await publisherService.findById(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Publisher not found"));
        }
        return res.send(document);
    } catch (error) {
        console.log(error);
        return next(
            new ApiError(500, `Error retrieving publisher with id ${req.params.id}`)
        );
    }
}

export async function findAll(req, res, next) {
    let documents = [];
    try {
        const { name } = req.query;
        if (name) {
            documents = await publisherService.findByName(name);
        } else {
            documents = await publisherService.find({});
        }
    } catch (error) {
        console.log(error);
        return next(
            new ApiError(500, "An error occurred while retrieving list of publishers")
        );
    }
    return res.send(documents);
}

export async function update(req, res, next) {
    if (Object.keys(req.body).length === 0) {
        return next(new ApiError(400, "Data to update cannot be empty"));
    }

    try {
        const document = await publisherService.update(req.params.id, req.body);
        if (!document) {
            return next(new ApiError(404, "Publisher not found"));
        }
        return res.send({ message: "Publisher updated successfully", document });
    } catch (error) {
        console.log(error);
        return next(
            new ApiError(500, `Error updating publisher with id ${req.params.id}`)
        );
    }
}

export async function deleteOne(req, res, next) {
    try {
        const document = await publisherService.delete(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Publisher not found"));
        }
        return res.send({ message: "Publisher deleted successfully" });
    } catch (error) {
        console.log(error);
        return next(
            new ApiError(500, `Could not delete publisher with id ${req.params.id}`)
        );
    }
}

export async function deleteAll(req, res, next) {
    try {
        const deleteResult = await publisherService.deleteAll();
        return res.send({
            message: `${deleteResult.deletedCount} publishers were deleted successfully`,
        });
    } catch (error) {
        console.log(error);
        return next(
            new ApiError(500, "An error occurred while deleting all publishers")
        );
    }
}

export default {
    create, findAll, findOne, update, deleteOne, deleteAll,
};