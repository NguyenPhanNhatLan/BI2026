import express from "express";
import { createNewCustomerController, deleteCustomerByIdController, getCustomersController } from "../controllers/customerController.js";

const customerRouter = express.Router();

customerRouter.post("/", createNewCustomerController);
customerRouter.get("/", getCustomersController);
customerRouter.delete("/:id", deleteCustomerByIdController);

export default customerRouter;