"use client";
import { useState, useEffect } from "react";
import { X, Calendar, User, MapPin } from "lucide-react";

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
}

export default function OrderDetailModal({ isOpen, onClose, orderId }: OrderDetailModalProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && orderId) {
      setLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
      fetch(`${API_URL}/orders/${orderId}/full`)
        .then(res => res.json())
        .then(json => setData(json.data))
        .catch(err => console.error("Error fetching order details:", err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, orderId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-xl w-full max-w-4xl h-[80vh] flex flex-col relative shadow-xl">
        <div className="p-5 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Order Details: <span className="text-blue-600">{orderId}</span></h2>
            {data?.order_placement_date && (
               <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                 <Calendar size={14} /> Placed on: {new Date(data.order_placement_date).toLocaleString()}
               </p>
            )}
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {loading ? ( <p className="text-center text-gray-500 py-10">Loading details...</p> ) : !data ? ( <p className="text-center text-red-500 py-10">Failed to load order details.</p> ) : (
            <div className="space-y-6">
              
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex gap-4 items-start">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                   <User size={24} />
                </div>
                <div>
                   <p className="text-sm text-gray-500 font-medium mb-1">Customer Info</p>
                   <p className="font-bold text-gray-800 text-lg">{data.customer?.customer_name}</p>
                   <p className="text-gray-600 flex items-center gap-1 mt-1 text-sm">
                      <MapPin size={14} /> {data.customer?.city}, {data.customer?.country}
                   </p>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-800 mb-3 text-lg border-b pb-2">Items Ordered</h3>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full text-left text-sm border-collapse whitespace-nowrap">
                    <thead>
                      <tr className="border-b bg-gray-50 text-gray-600">
                        <th className="p-3 font-semibold">Product</th>
                        <th className="p-3 text-center font-semibold">Qty</th>
                        <th className="p-3 text-center font-semibold">Req. Delivery</th>
                        <th className="p-3 text-center font-semibold">Act. Delivery</th>
                        <th className="p-3 text-right font-semibold">Price</th>
                        <th className="p-3 text-right font-semibold">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.order_lines?.map((line: any, idx: number) => {
                        const price = line.products?.price || 0;
                        const reqDate = line.requested_delivery_date ? new Date(line.requested_delivery_date).toLocaleDateString() : "-";
                        const actDate = line.actual_delivery_date ? new Date(line.actual_delivery_date).toLocaleDateString() : "Pending";
                        
                        return (
                          <tr key={idx} className="border-b last:border-0 hover:bg-gray-50 transition">
                            <td className="p-3 font-medium text-gray-800">{line.products?.product_name || line.product_id}</td>
                            <td className="p-3 text-center">{line.order_qty}</td>
                            <td className="p-3 text-center text-gray-600">{reqDate}</td>
                            <td className="p-3 text-center">
                              <span className={`px-2 py-1 rounded-md text-xs font-medium ${line.actual_delivery_date ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {actDate}
                              </span>
                            </td>
                            <td className="p-3 text-right text-gray-600">${price}</td>
                            <td className="p-3 text-right font-semibold text-gray-800">${(price * line.order_qty).toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}