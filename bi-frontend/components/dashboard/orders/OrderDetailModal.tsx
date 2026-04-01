"use client";
import { useState, useEffect } from "react";
import { X } from "lucide-react";

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
      fetch(`http://localhost:5001/orders/${orderId}/full`)
        .then(res => res.json())
        .then(json => setData(json.data))
        .finally(() => setLoading(false));
    }
  }, [isOpen, orderId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-xl w-full max-w-2xl h-[80vh] flex flex-col relative">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-bold">Order Details: {orderId}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {loading ? ( <p className="text-center text-gray-500">Loading details...</p> ) : !data ? ( <p className="text-center text-red-500">Failed to load</p> ) : (
            <div className="space-y-6">
              {/* Thông tin khách hàng */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <p className="text-sm text-gray-500">Customer Info</p>
                <p className="font-bold text-gray-800 text-lg">{data.customer?.customer_name}</p>
                <p className="text-gray-600">{data.customer?.city}, {data.customer?.country}</p>
              </div>

              {/* Danh sách sản phẩm */}
              <div>
                <h3 className="font-bold text-gray-800 mb-2">Items Ordered</h3>
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="p-2">Product</th>
                      <th className="p-2 text-right">Qty</th>
                      <th className="p-2 text-right">Price</th>
                      <th className="p-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.order_lines?.map((line: any, idx: number) => {
                      const price = line.products?.price || 0;
                      return (
                        <tr key={idx} className="border-b">
                          <td className="p-2">{line.products?.product_name || line.product_id}</td>
                          <td className="p-2 text-right">{line.order_qty}</td>
                          <td className="p-2 text-right">${price}</td>
                          <td className="p-2 text-right font-medium">${(price * line.order_qty).toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}