import express from "express";
import auth from "../middlewares/auth.middleware.js";
import StaffController from "../controllers/staff.controller.js";

const router = express.Router();

router.route("/login").post(StaffController.login);

router.route("/")
    .post(StaffController.create)
    .get(StaffController.findAll)
    .delete(auth, StaffController.deleteAll);

router.route("/:id")
    .put(auth, StaffController.update)
    .get(auth, StaffController.findOne)
    .delete(auth, StaffController.deleteOne);

export default router;