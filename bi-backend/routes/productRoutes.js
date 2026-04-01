import express from "express";
import { createProductController, deleteProductController, getProductByIdController, getProductsController, updateProductController } from "../controllers/productController.js";



const productRouter = express.Router();

productRouter.get("/", getProductsController);
productRouter.post("/", createProductController);
productRouter.get("/:id", getProductByIdController);
productRouter.put("/:id", updateProductController);
productRouter.delete("/:id", deleteProductController);

export default productRouter;