import BookService from "../services/book.service.js";
import ApiError from "../api-error.js";

const bookService = new BookService();

export async function create(req, res, next) {
    if (!req.body?.title) {
        return next(new ApiError(400, "Book title cannot be empty"));
    }

    try {
        const document = await bookService.create(req.body);
        return res.status(201).json({ message: "Book created successfully" }, document);
    } catch (error) {
        console.log(error);
        return next(new ApiError(500, "Error while creating book"));
    }
}

export async function findAll(req, res, next) {
    let documents = [];

    try {
        const { title } = req.query;
        if (title) {
            documents = await bookService.findByName(title);
        } else {
            documents = await bookService.find({});
        }
    } catch (error) {
        console.log(error);
        return next(
            new ApiError(500, "An error occurred while retrieving the list of books")
        );
    }
    return res.json(documents);
};

export async function findOne(req, res, next) {
    try {
        const document = await bookService.findById(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Book not found"));
        }
        return res.json(document);
    } catch (error) {
        console.log(error);
        return next(
            new ApiError(500, `Error while retrieving book with id ${req.params.id}`)
        );
    }
};

export async function update(req, res, next) {
    if (Object.keys(req.body).length === 0) {
        return next(new ApiError(400, "Data to update cannot be empty"));
    }

    try {
        const document = await bookService.update(req.params.id, req.body);

        if (!document) {
            return next(new ApiError(404, "Book not found"));
        }

        return res.send({ message: "Book updated successfully" }, document);
    } catch (error) {
        console.log(error);
        return next(
            new ApiError(500, `Error while updating book with id ${req.params.id}`)
        );
    }
};

export async function deleteOne(req, res, next) {
    try {
        const document = await bookService.delete(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Book not found"));
        }
        return res.json({ message: "Book deleted successfully" });
    } catch (error) {
        console.log(error);
        return next(
            new ApiError(500, `Could not delete book with id ${req.params.id}`)
        );
    }
};

export async function deleteAll(req, res, next) {
    try {
        const deleteCount = await bookService.deleteAll();
        return res.json({
            message: `${deleteCount} books were deleted successfully`
        });
    } catch (error) {
        console.log(error);
        return next(
            new ApiError(500, "An error occurred while deleting all books")
        );
    }
};

export default {
    create, findAll, findOne, update, deleteOne, deleteAll,
};