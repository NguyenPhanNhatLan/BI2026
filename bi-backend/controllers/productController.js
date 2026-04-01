import { createProduct, deleteProduct, getProductById, getProducts, updateProduct } from "../services/productServices.js";

export const getProductsController = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const { search, category } = req.query;

        const result = await getProducts(page, limit, search, category);

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách sản phẩm thành công",
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

export const getProductByIdController = async (req, res) => {
    try {
        const product = await getProductById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
        }
        return res.status(200).json({ success: true, message: "Lấy chi tiết thành công", data: product });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const createProductController = async (req, res) => {
    try {
        const newProduct = await createProduct(req.body);
        return res.status(201).json({ success: true, message: "Tạo sản phẩm thành công", data: newProduct });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const updateProductController = async (req, res) => {
    try {
        const updatedProduct = await updateProduct(req.params.id, req.body);
        return res.status(200).json({ success: true, message: "Cập nhật sản phẩm thành công", data: updatedProduct });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteProductController = async (req, res) => {
    try {
        await deleteProduct(req.params.id);
        return res.status(200).json({ success: true, message: "Xóa sản phẩm thành công" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};