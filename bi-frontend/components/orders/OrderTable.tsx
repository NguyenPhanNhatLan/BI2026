"use client";

import { useState, useEffect } from "react";
import { useOrders } from "@/hooks/useOrders";
import { ChevronLeft, ChevronRight, Clock, Eye, Trash2, RefreshCcw } from "lucide-react";
import OrderDetailModal from "./OrderDetailModal";
import OrderStatusModal from "./OrderStatusModal";



interface OrderTableProps { filter: any; }

const getStatusBadge = (status: string) => { 
  switch (status?.toLowerCase()) {
    case 'completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'processing': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

export default function OrderTable({ filter }: OrderTableProps) {
  const [page, setPage] = useState(1);
  const limit = 10; 
  
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => { setPage(1); }, [filter]);

  const { orders, meta, isLoading, error } = useOrders(filter, page, limit, refreshTrigger);

  const handleViewDetails = (order: any) => {
    setSelectedOrder(order);
    setDetailModalOpen(true);
  };


  const handleUpdateStatus = (order: any) => {
    setSelectedOrder(order);
    setStatusModalOpen(true);
  };

  const handleDelete = async (orderId: string) => {
    if (window.confirm(`Xoá vĩnh viễn đơn hàng ${orderId}?`)) {
      try {
        const res = await fetch(`http://localhost:5001/orders/${orderId}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
           alert("Xoá thành công!");
           setRefreshTrigger(prev => prev + 1); 
        } else alert("Lỗi: " + data.message);
      } catch (err) { alert("Lỗi kết nối"); }
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-4">Order ID</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Lead Time</th>
              <th className="px-6 py-4">Placement Date</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {isLoading ? ( 
               <tr><td colSpan={6} className="text-center py-4">Loading...</td></tr>
            ) : error ? (
              <tr><td colSpan={6} className="px-6 py-10 text-center text-red-500">{error}</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400 font-medium">Order not found!</td></tr>
            ) : (
              orders.map((order) => (
                <tr key={order.order_id} className="hover:bg-gray-50 transition group">
                  <td className="px-6 py-4 font-mono text-gray-600 font-medium">#{order.order_id.substring(0, 8)}</td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-800">{order.customers?.customer_name || 'Khách lẻ'}</p>
                    <p className="text-xs text-gray-500">{order.customers?.city}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full border capitalize ${getStatusBadge(order.status)}`}>{order.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-600 font-medium"><Clock size={16} className="text-gray-400" />{order.processing_time || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(order.order_placement_date).toLocaleDateString('vi-VN')}
                  </td>
                  
     
                  <td className="px-6 py-4 flex justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleViewDetails(order)} className="text-blue-500 hover:text-blue-700 transition"><Eye size={18} /></button>
                    <button onClick={() => handleUpdateStatus(order)} className="text-emerald-500 hover:text-emerald-700 transition"><RefreshCcw size={18} /></button>
                    <button onClick={() => handleDelete(order.order_id)} className="text-red-500 hover:text-red-700 transition"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>


      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
        <span className="text-sm text-gray-500">Page <span className="font-semibold">{page}</span> / <span className="font-semibold">{meta?.totalPages || 1}</span></span>
        <div className="flex items-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || isLoading} className="px-3 py-1.5 border rounded-lg bg-white disabled:opacity-50"><ChevronLeft size={16}/></button>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= (meta?.totalPages || 1) || isLoading} className="px-3 py-1.5 border rounded-lg bg-white disabled:opacity-50"><ChevronRight size={16}/></button>
        </div>
      </div>

      {selectedOrder && (
        <>
          <OrderDetailModal 
             isOpen={detailModalOpen} 
             onClose={() => setDetailModalOpen(false)} 
             orderId={selectedOrder.order_id} 
          />
          <OrderStatusModal 
             isOpen={statusModalOpen} 
             onClose={() => setStatusModalOpen(false)} 
             orderId={selectedOrder.order_id} 
             currentStatus={selectedOrder.status}
             onSuccess={() => setRefreshTrigger(prev => prev + 1)} 
          />
        </>
      )}

    </div>
  );
}