import { createCustomer, deleteCustomer, getCustomers } from "../services/customerServices.js";

export const getCustomersController = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20; 
        const city = req.query.city || "";

        const result = await getCustomers(page, limit, city);

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách khách hàng thành công",
            data: result.data,
            meta: {
                currentPage: page,
                limit: limit,
                totalRecords: result.totalRecords,
                totalPages: result.totalPages,
            },
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const createNewCustomerController = async (req, res) => {
  try {
    const customer = req.body;

    const data = await createCustomer(customer);

    const io = req.app.get("socketio");
    if (io) {
      io.emit("customer_created", data);
    }

    res.status(201).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Create failed" });
  }
};

export const updateCustomerByIdController = async (req, res) => {
  try {
    const id = req.params.id;
    const customer = req.body;

    const data = await updateCustomer(id, customer);

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Update failed" });
  }
};

export const deleteCustomerByIdController = async (req, res) => {
  try {
    const id = req.params.id;

    await deleteCustomer(id);

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed" });
  }
};