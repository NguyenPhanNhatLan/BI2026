import { createCustomer, deleteCustomer, getCustomers, updateCustomer } from "../services/customerServices.js";
import { asyncHandler } from "../utils/errorHandler.js";


export const getCustomersController = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20; 
    const city = req.query.city || "";

    const result = await getCustomers(page, limit, city);

    res.status(200).json({
        success: true,
        message: "Lấy danh sách khách hàng thành công",
        data: result.data,
        meta: { currentPage: page, limit, totalRecords: result.totalRecords, totalPages: result.totalPages },
    });
});

export const createNewCustomerController = asyncHandler(async (req, res) => {
    const data = await createCustomer(req.body);

    const io = req.app.get("socketio");
    if (io) io.emit("customer_created", data);

    res.status(201).json({ success: true, data });
});

export const updateCustomerByIdController = asyncHandler(async (req, res) => {
    const data = await updateCustomer(req.params.id, req.body);
    res.status(200).json({ success: true, data });
});

export const deleteCustomerByIdController = asyncHandler(async (req, res) => {
    await deleteCustomer(req.params.id);
    res.status(200).json({ success: true, message: "Deleted successfully" });
});