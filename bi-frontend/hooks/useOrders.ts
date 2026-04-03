import { useState, useEffect } from "react";

export interface OrderItemPayload {
  product_id: string;
  order_qty: number;
  requested_delivery_date?: string | null; 
  actual_delivery_date?: string | null;
}

export interface OrderPayload {
  customer_id: string;
  status?: string;
  order_placement_date?: string;
  items: OrderItemPayload[];
}

interface FilterParams {
  status?: string;
  from?: string;
  to?: string;
  city?: string;
}

export function useOrders(
  filter: FilterParams = {}, 
  page: number = 1,
  limit: number = 5,
  refreshTrigger: number = 0,
  options: { skipFetch?: boolean } = {} // Thêm option này
) {
  const [orders, setOrders] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  // Nếu skipFetch = true, không cần hiện loading ban đầu
  const [isLoading, setIsLoading] = useState(!options.skipFetch); 
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

  const createOrder = async (payload: OrderPayload) => {
    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.message || "Lỗi từ server");
      return data;
    } catch (error: any) {
      throw new Error(error.message || "Lỗi khi tạo đơn hàng");
    }
  };

  const updateOrderFull = async (orderId: string, payload: OrderPayload) => {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.message || "Lỗi từ server");
      return data;
    } catch (error: any) {
      throw new Error(error.message || "Lỗi khi cập nhật đơn hàng");
    }
  };

  useEffect(() => {
    if (options.skipFetch) return;

    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        if (filter.status) params.append("status", filter.status);
        if (filter.from) params.append("from", filter.from);
        if (filter.to) params.append("to", filter.to);
        if (filter.city) params.append("city", filter.city);

        const res = await fetch(`${API_URL}/orders/filter?${params.toString()}`);
        if (!res.ok) throw new Error("Lỗi kết nối đến server");

        const json = await res.json();

        if (json.success) {
          setOrders(json.data);
          setMeta(json.meta);
        } else {
          throw new Error(json.message);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [
    filter.status, filter.from, filter.to, filter.city, 
    page, limit, refreshTrigger, options.skipFetch
  ]);

  return { 
    orders, 
    meta, 
    isLoading, 
    error, 
    createOrder, 
    updateOrderFull 
  };
}