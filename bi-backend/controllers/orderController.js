import {
  getOrderById,
  getRawOrders,
  getOrderDetails,
  createOrder,
  updateOrderStatus,
  deleteOrder,
} from "../services/orderServices.js";
import { asyncHandler } from "../utils/errorHandler.js";


export const getFilteredOrdersController = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const { status, from, to, city } = req.query;

  const result = await getRawOrders(page, limit, status, from, to, city);

  res.status(200).json({
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
});

export const getOrderByIdController = asyncHandler(async (req, res) => {
  const orderId = req.params.id;
  if (!orderId) throw new Error("Yêu cầu cung cấp Order ID");

  const order = await getOrderById(orderId);
  if (!order)
    return res
      .status(404)
      .json({ success: false, message: `Không tìm thấy đơn hàng ${orderId}` });

  res.status(200).json({
    success: true,
    message: "Lấy chi tiết đơn hàng thành công",
    data: order,
  });
});

export const getOrderDetailsController = asyncHandler(async (req, res) => {
  const orderId = req.params.id;
  if (!orderId) throw new Error("Yêu cầu cung cấp Order ID");

  const data = await getOrderDetails(orderId);
  if (!data)
    return res
      .status(404)
      .json({ success: false, message: "Không tìm thấy chi tiết đơn hàng" });

  res.status(200).json({
    success: true,
    message: "Lấy chi tiết đầy đủ thành công",
    data: data,
  });
});

export const createOrderController = asyncHandler(async (req, res) => {
  const { items, ...orderData } = req.body;

  if (!customer_id) throw new Error("Thiếu thông tin Khách hàng (customer_id)");
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error("Đơn hàng phải có ít nhất 1 sản phẩm");
  }

  const result = await createOrder(orderData, items);


  const io = req.app.get("socketio");
  if (io)
    io.emit("ORDER_UPDATED", {
      message: `Có đơn hàng mới: ${result.order_id}`,
      order_id: result.order_id,
    });

  res
    .status(201)
    .json({ success: true, message: "Tạo đơn hàng thành công", data: result });
});

export const updateOrderStatusController = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const orderId = req.params.id;

  if (!status) throw new Error("Yêu cầu cung cấp trạng thái mới");

  const data = await updateOrderStatus(orderId, status);

  const io = req.app.get("socketio");
  if (io)
    io.emit("ORDER_UPDATED", {
      message: `Đơn ${orderId} vừa đổi trạng thái thành ${status}`,
      order_id: orderId,
      status,
    });

  res
    .status(200)
    .json({ success: true, message: "Cập nhật trạng thái thành công", data });
});

export const deleteOrderController = asyncHandler(async (req, res) => {
  const orderId = req.params.id;

  await deleteOrder(orderId);

  const io = req.app.get("socketio");
  if (io)
    io.emit("ORDER_UPDATED", {
      message: `Đã xoá đơn hàng: ${orderId}`,
      order_id: orderId,
    });

  res.status(200).json({ success: true, message: "Xoá đơn hàng thành công" });
});

export const updateOrderFullController = asyncHandler(async (req, res) => {
  const orderId = req.params.id;
  const { items, ...orderData } = req.body;

  if (!orderId) throw new Error("Yêu cầu cung cấp Order ID");

  const result = await updateOrderFull(orderId, orderData, items);

  const io = req.app.get("socketio");
  if (io)
    io.emit("ORDER_UPDATED", {
      message: `Đơn hàng ${orderId} vừa được cập nhật toàn bộ thông tin`,
      order_id: orderId,
    });

  res.status(200).json({ success: true, message: "Cập nhật đơn hàng thành công", data: result });
});
