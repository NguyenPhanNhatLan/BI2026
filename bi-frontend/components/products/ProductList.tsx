"use client";

import { Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

interface ProductListProps {
  products: any[];
  meta: any;
  isLoading: boolean;
  error: string | null;
  page: number;
  setPage: (page: number) => void;
  onEdit: (product: any) => void;
  onDelete: (productId: string) => void;
}

export default function ProductList({
  products,
  meta,
  isLoading,
  error,
  page,
  setPage,
  onEdit,
  onDelete
}: ProductListProps) {
  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-4">Product ID</th>
              <th className="px-6 py-4">Product Name</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4 text-right">Cost</th>
              <th className="px-6 py-4 text-right">Price</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse bg-white">
                  <td colSpan={6} className="px-6 py-4">
                    <div className="h-4 bg-gray-100 rounded w-full"></div>
                  </td>
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-red-500">{error}</td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-400 font-medium">
                  Không tìm thấy sản phẩm nào.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.product_id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-mono text-gray-600">{product.product_id}</td>
                  <td className="px-6 py-4 font-semibold text-gray-800">{product.product_name}</td>
                  <td className="px-6 py-4 text-gray-600">
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs">{product.category || "N/A"}</span>
                  </td>
                  <td className="px-6 py-4 text-right text-gray-600">${product.cost?.toLocaleString() || 0}</td>
                  <td className="px-6 py-4 text-right font-medium text-emerald-600">${product.price?.toLocaleString() || 0}</td>
                  <td className="px-6 py-4 flex justify-center gap-3">
                    <button 
                      onClick={() => onEdit(product)}
                      className="text-blue-500 hover:text-blue-700 transition"
                      title="Sửa"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => onDelete(product.product_id)}
                      className="text-red-500 hover:text-red-700 transition"
                      title="Xóa"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Phân trang */}
      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
        <span className="text-sm text-gray-500">
          Trang <span className="font-semibold text-gray-700">{page}</span> / <span className="font-semibold text-gray-700">{meta?.totalPages || 1}</span>
          {' '} ({meta?.totalRecords || 0} sản phẩm)
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1 || isLoading}
            className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= (meta?.totalPages || 1) || isLoading}
            className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}