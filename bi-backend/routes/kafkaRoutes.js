import express from "express";
import { publishEventController } from "../controllers/kafkaController.js";

const EventRouter = express.Router();

EventRouter.post("/publish", publishEventController);

export default EventRouter;