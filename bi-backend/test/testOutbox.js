import dotenv from "dotenv";
import { createOrder } from "../services/orderServices.js";
dotenv.config();


async function runTest() {
  console.log("Đang khởi tạo đơn hàng test...");

  try {
    const mockCustomerId = "CUST-9999"; 
    const mockItems = [
      { product_id: "PROD-A", order_qty: 2 },
      { product_id: "PROD-B", order_qty: 5 }
    ];

    const result = await createOrder(mockCustomerId, "pending", mockItems);
    
    console.log("Thành công!", result);
    console.log("Bây giờ hãy mở bảng 'orders' và 'outbox_events' trên Supabase để kiểm tra!");

  } catch (error) {
    console.error("Lỗi", error.message);
  } finally {
    process.exit(0);
  }
}

runTest();