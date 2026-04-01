"use client";

import { useState, useEffect } from "react";
import { X, Search, User } from "lucide-react";

interface CustomerSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (customer: any) => void; 
}

export default function CustomerSelectModal({ isOpen, onClose, onSelect }: CustomerSelectModalProps) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Tải danh sách khi mở Modal
  useEffect(() => {
    if (isOpen) {
      const fetchCustomers = async () => {
        setIsLoading(true);
        try {
          const params = new URLSearchParams({ limit: '20' }); // Lấy 20 người đầu tiên
          if (searchInput) params.append("search", searchInput);

          const res = await fetch(`http://localhost:5001/customers?${params.toString()}`);
          const json = await res.json();
          if (json.success) setCustomers(json.data || []);
        } catch (error) {
          console.error("Lỗi tải khách hàng:", error);
        } finally {
          setIsLoading(false);
        }
      };
      
      // Debounce search để tránh gọi API liên tục
      const timeoutId = setTimeout(() => {
          fetchCustomers();
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen, searchInput]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 h-[80vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Select Customer</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-full transition">
            <X size={20} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, phone or city..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            />
          </div>
        </div>

        {/* List of Customers */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {isLoading ? (
            <div className="text-center text-gray-500 py-10">Đang tải danh sách...</div>
          ) : customers.length === 0 ? (
            <div className="text-center text-gray-400 py-10 font-medium">Không tìm thấy khách hàng nào.</div>
          ) : (
            customers.map((c) => (
              <button
                key={c.customer_id}
                type="button"
                onClick={() => {
                  onSelect(c);
                  onClose();   
                }}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:bg-blue-50 hover:border-blue-200 transition text-left group"
              >
                <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center group-hover:bg-blue-100 group-hover:text-blue-600">
                  <User size={24} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 group-hover:text-blue-700">{c.customer_name}</p>
                  <p className="text-xs text-gray-500">{c.city || "Không rõ địa chỉ"} • #{c.customer_id.substring(0,8)}...</p>
                </div>
                <span className="text-xs font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition">Select</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}