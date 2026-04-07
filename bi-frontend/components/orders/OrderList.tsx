"use client";
import { StepBack, StepForward, Eye } from "lucide-react";
import { useEffect, useState } from "react";

export default function OrderList() {
    const [orders, setOrders] = useState<any[]>([]);
    const [page, setPage] = useState(1);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await fetch(
                    `http://localhost:5001/orders?page=${page}&limit=10`
                );
                const data = await res.json();
                setOrders(data.data || []);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu:", error);
            }
        };
        fetchOrders();
    }, [page]);

    return (
        <div className="flex-1 flex flex-col h-full w-full min-h-0">
            
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex-1 flex flex-col overflow-hidden min-h-0">
                
                <div className="overflow-y-auto flex-1 custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                    
                        <thead className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm shadow-[0_1px_0_0_#f3f4f6]">
                            <tr className="text-sm font-medium text-gray-500">
                                <th className="py-4 px-6 w-32">Mã đơn</th>
                                <th className="py-4 px-6">Khách hàng</th>
                                <th className="py-4 px-6">Khu vực</th>
                                <th className="py-4 px-6 w-40">Trạng thái</th>
                                <th className="py-4 px-6 text-center w-24">Thao tác</th>
                            </tr>
                        </thead>
                        
                        <tbody className="divide-y divide-gray-50 bg-white">
                            {orders.map((c, index) => (
                                <tr 
                                    key={c.order_id || index} 
                                    className="hover:bg-gray-50/80 transition-colors group"
                                >
                                    <td className="py-4 px-6">
                                        <span className="font-mono text-sm font-medium text-gray-600 bg-gray-100/80 px-2 py-1 rounded-md border border-gray-200/60">
                                            #{c.order_id}
                                        </span>
                                    </td>

                                    <td className="py-4 px-6">
                                        <div className="text-base font-medium text-gray-800">
                                            {c.customers?.customer_name || 'Khách vãng lai'}
                                        </div>
                                        {c.customers?.customer_id && (
                                            <div className="text-sm text-gray-400 mt-0.5">
                                                ID: {c.customers.customer_id}
                                            </div>
                                        )}
                                    </td>

                                    <td className="py-4 px-6">
                                        <span className="text-gray-600 text-sm">
                                            {c.customers?.city || '—'}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200/60">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>
                                            Đã hoàn thành
                                        </span>
                                    </td>

                                    <td className="py-4 px-6 text-center">
                                        <button 
                                            onClick={() => console.log("Xem chi tiết", c)}
                                            className="text-gray-300 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-blue-50 inline-flex justify-center group-hover:text-gray-500"
                                            title="Xem chi tiết"
                                        >
                                            <Eye size={18} strokeWidth={2} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {orders.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                            <span className="text-sm">Chưa có đơn hàng nào</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between mt-5 shrink-0">
                <div className="text-sm text-gray-500">
                    Hiển thị <span className="font-medium text-gray-800">{(page - 1) * 10 + 1}</span> - <span className="font-medium text-gray-800">{(page - 1) * 10 + orders.length}</span> kết quả
                </div>
                
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-40 disabled:hover:bg-white transition-all shadow-sm"
                    >
                        <StepBack size={16} />
                    </button>

                    <button
                        onClick={() => setPage(page + 1)}
                        disabled={orders.length < 10} 
                        className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-40 disabled:hover:bg-white transition-all shadow-sm"
                    >
                        <StepForward size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}