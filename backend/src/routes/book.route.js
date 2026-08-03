import express from "express";
import auth from "../middlewares/auth.middleware.js";
import BookController from "../controllers/book.controller.js";
import { cacheBookSearch } from "../middlewares/cache.middleware.js"; // [THÊM MỚI] Import middleware cache

const router = express.Router();

router.route("/")
    .post(BookController.create)
    .get(cacheBookSearch, BookController.findAll) // [CẬP NHẬT] Thêm middleware cacheBookSearch
    .delete(auth, BookController.deleteAll);

router.route("/:id")
    .get(BookController.findOne)
    .put(auth, BookController.update)
    .delete(auth, BookController.deleteOne);

export default router;