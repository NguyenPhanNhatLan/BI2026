import { createProduct, deleteProduct, getProductById, getProducts, updateProduct } from "../services/productServices.js";
import { asyncHandler } from "../utils/errorHandler.js";

export const getProductsController = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { search, category } = req.query;

    const result = await getProducts(page, limit, search, category);

    res.status(200).json({
        success: true,
        message: "Lấy danh sách sản phẩm thành công",
        data: result.data,
        meta: { currentPage: page, limit, totalRecords: result.totalRecords, totalPages: result.totalPages },
    });
});

export const getProductByIdController = asyncHandler(async (req, res) => {
    const product = await getProductById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
    
    res.status(200).json({ success: true, message: "Lấy chi tiết thành công", data: product });
});

export const createProductController = asyncHandler(async (req, res) => {
    const newProduct = await createProduct(req.body);
    res.status(201).json({ success: true, message: "Tạo sản phẩm thành công", data: newProduct });
});

export const updateProductController = asyncHandler(async (req, res) => {
    const updatedProduct = await updateProduct(req.params.id, req.body);
    res.status(200).json({ success: true, message: "Cập nhật sản phẩm thành công", data: updatedProduct });
});

export const deleteProductController = asyncHandler(async (req, res) => {
    await deleteProduct(req.params.id);
    res.status(200).json({ success: true, message: "Xóa sản phẩm thành công" });
});