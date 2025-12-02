import express from "express";
import auth from "../middlewares/auth.middleware.js";
import BorrowController from "../controllers/borrow.controller.js";

const router = express.Router();

router.route("/")
    .post(BorrowController.create)
    .get(auth, BorrowController.findAll)
    .delete(auth, BorrowController.deleteAll);

router.route("/:id")
    .get(auth, BorrowController.findOne)
    .put(auth, BorrowController.update)
    .delete(auth, BorrowController.deleteOne);

export default router;
