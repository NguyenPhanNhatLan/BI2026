"use client";

import { useState } from "react";
import { Search, Plus } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import ProductList from "@/components/products/ProductList";
import ProductModal from "@/components/products/ProductModal";


export default function ProductPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // Gọi hook lấy dữ liệu
  const { products, meta, isLoading, error, reloadData } = useProducts(page, 10, searchInput);

  const handleAdd = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  // Xử lý khi nhấn nút Sửa (Tạm thời in ra console)
  const handleEdit = (product: any) => {
    setEditingProduct(product); // Có data tức là đang Edit
    setIsModalOpen(true);
  };

  // Xử lý khi nhấn nút Xóa (Có gọi API thật)
  const handleDelete = async (productId: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa sản phẩm ${productId} không?`)) return;

    try {
      const res = await fetch(`http://localhost:5001/products/${productId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        alert("Xóa thành công!");
        reloadData();
      } else {
        alert("Lỗi: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Đã xảy ra lỗi khi xóa");
    }
  };

  // Nếu gõ tìm kiếm thì tự động quay về trang 1
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
    setPage(1);
  };

  return (
    <div className="max-w-350 mx-auto p-6 space-y-6 bg-gray-50 min-h-screen font-sans">

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Products Management
        </h1>

        <div className="flex items-center gap-3">
          {/* Thanh tìm kiếm */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchInput}
              onChange={handleSearchChange}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
            />
          </div>

          <button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm font-medium"
          >
            <Plus size={18} /> Add Product
          </button>
        </div>
      </div>

      <ProductList
        products={products}
        meta={meta}
        isLoading={isLoading}
        error={error}
        page={page}
        setPage={setPage}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <ProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        product={editingProduct} 
        onSuccess={reloadData} 
      />

    </div>
  );
}