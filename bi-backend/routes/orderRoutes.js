import express from "express";
import { 
    getFilteredOrdersController, 
    createOrderController, 
    getOrderDetailsController, 
    updateOrderStatusController, 
    deleteOrderController 
} from "../controllers/orderController.js";

const router = express.Router();

router.get("/filter", getFilteredOrdersController);
router.post("/", createOrderController);
router.get("/:id/full", getOrderDetailsController);
router.patch("/:id/status", updateOrderStatusController);
router.delete("/:id", deleteOrderController);

export default router;