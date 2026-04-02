import express from "express";
import { 
    getFilteredOrdersController, 
    createOrderController, 
    getOrderDetailsController, 
    updateOrderStatusController, 
    deleteOrderController, 
    updateOrderFullController
} from "../controllers/orderController.js";

const router = express.Router();

router.get("/filter", getFilteredOrdersController);
router.post("/", createOrderController);
router.get("/:id/full", getOrderDetailsController);
router.put("/:id", updateOrderFullController);
router.patch("/:id/status", updateOrderStatusController);
router.delete("/:id", deleteOrderController);

export default router;