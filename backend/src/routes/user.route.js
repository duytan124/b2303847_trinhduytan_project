import express from "express";
import auth from "../middlewares/auth.middleware.js";
import UserController from "../controllers/user.controller.js";

const router = express.Router();

router.post("/login", UserController.login);
router.post("/register", UserController.create);

router.route("/")
    .post(UserController.create)
    .get(auth, UserController.findAll)
    .delete(auth, UserController.deleteAll);

router.route("/:id")
    .put(auth, UserController.update)
    .get(auth, UserController.findOne)
    .delete(auth, UserController.deleteOne);

export default router;