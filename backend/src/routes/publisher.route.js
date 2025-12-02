import express from "express";
import auth from "../middlewares/auth.middleware.js";
import PublisherController from "../controllers/publisher.controller.js";

const router = express.Router();

router.route("/")
    .post(auth, PublisherController.create)
    .get(PublisherController.findAll)
    .delete(auth, PublisherController.deleteAll);

router.route("/:id")
    .get(PublisherController.findOne)
    .put(auth, PublisherController.update)
    .delete(auth, PublisherController.deleteOne);

export default router;
