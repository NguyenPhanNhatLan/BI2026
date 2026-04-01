import { io } from "../server.js";
import {
  getOrderById,
  getRawOrders,
  getOrderStats,
  getOrderDetails,
  createOrder,
  updateOrderStatus,
  deleteOrder,
} from "../services/orderServices.js"; 


export const getOrderSummaryController = async (req, res) => {
  try {
    const { status, from, to, city } = req.query;
    
    // TODO (Phase 2): Hiện tại hàm này đang gọi RPC của Supabase. 
    // Sau khi setup xong Kafka -> ClickHouse, ta sẽ đổi hàm getOrderStats 
    // để query thẳng vào ClickHouse nhằm lấy chỉ số OTIF real-time cực nhanh.
    const stats = await getOrderStats(status, from, to, city);

    return res.status(200).json({
      success: true,
      message: "Lấy tổng quan đơn hàng thành công",
      data: stats,
    });
  } catch (error) {
    console.error("[getOrderSummary] Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getFilteredOrdersController = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { status, from, to, city } = req.query;
    
    const result = await getRawOrders(page, limit, status, from, to, city);

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách đơn hàng thành công",
      data: result.data,
      meta: {
        currentPage: page,
        limit: limit,
        totalRecords: result.totalRecords,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    console.error("[getFilteredOrders] Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrderByIdController = async (req, res) => {
  try {
    const orderId = req.params.id;
    if (!orderId) return res.status(400).json({ success: false, message: "Yêu cầu cung cấp Order ID" });

    const order = await getOrderById(orderId);
    if (!order) return res.status(404).json({ success: false, message: `Không tìm thấy đơn hàng ${orderId}` });

    return res.status(200).json({ success: true, message: "Lấy chi tiết đơn hàng thành công", data: order });
  } catch (err) {
    console.error("[getOrderById] Error:", err);
    return res.status(500).json({ success: false, message: "Lỗi hệ thống khi lấy đơn hàng" });
  }
};

export const getOrderDetailsController = async (req, res) => {
  try {
    const orderId = req.params.id;
    if (!orderId) return res.status(400).json({ success: false, message: "Yêu cầu cung cấp Order ID" });

    const data = await getOrderDetails(orderId);
    if (!data) return res.status(404).json({ success: false, message: "Không tìm thấy chi tiết đơn hàng" });

    return res.status(200).json({ success: true, message: "Lấy chi tiết đầy đủ thành công", data: data });
  } catch (err) {
    console.error("[getOrderDetails] Error:", err);
    return res.status(500).json({ success: false, message: "Lỗi hệ thống khi lấy chi tiết đơn hàng" });
  }
};

// ==========================================
// NHÓM GHI DỮ LIỆU (WRITE - OUTBOX PATTERN)
// ==========================================

export const createOrderController = async (req, res) => {
    try {
        const { customer_id, status, items } = req.body;

        // Validate cơ bản
        if (!customer_id) return res.status(400).json({ success: false, message: "Thiếu thông tin Khách hàng (customer_id)" });
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: "Đơn hàng phải có ít nhất 1 sản phẩm" });
        }

        // Gọi Service: Quá trình này sẽ bao gồm cả INSERT order VÀ ghi event vào outbox_events
        const result = await createOrder(customer_id, status, items);

        // Phát sự kiện UI tức thời cho nhân viên. 
        // Còn số liệu thống kê BI Dashboard sẽ do Relay Worker đẩy qua Kafka xử lý ngầm.
        if (io) io.emit('ORDER_UPDATED', { message: `Có đơn hàng mới: ${result.order_id}`, order_id: result.order_id });

        return res.status(201).json({ success: true, message: "Tạo đơn hàng thành công", data: result });
    } catch (error) {
        console.error("[createOrder] Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const updateOrderStatusController = async (req, res) => {
    try {
        const { status } = req.body;
        const orderId = req.params.id;

        if (!status) return res.status(400).json({ success: false, message: "Yêu cầu cung cấp trạng thái mới" });

        // Vừa cập nhật trạng thái, vừa chèn sự kiện UPDATE vào bảng outbox
        const data = await updateOrderStatus(orderId, status);
        
        if (io) io.emit('ORDER_UPDATED', { message: `Đơn ${orderId} vừa đổi trạng thái thành ${status}`, order_id: orderId, status });
        
        return res.status(200).json({ success: true, message: "Cập nhật trạng thái thành công", data });
    } catch (error) {
        console.error("[updateOrderStatus] Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteOrderController = async (req, res) => {
    try {
        const orderId = req.params.id;
        
        // Vừa xóa đơn hàng, vừa chèn sự kiện DELETE vào bảng outbox
        await deleteOrder(orderId);

        if (io) io.emit('ORDER_UPDATED', { message: `Đã xoá đơn hàng: ${orderId}`, order_id: orderId });

        return res.status(200).json({ success: true, message: "Xoá đơn hàng thành công" });
    } catch (error) {
        console.error("[deleteOrder] Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};