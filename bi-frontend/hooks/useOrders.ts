import { useState, useEffect } from "react";

interface FilterParams {
  status?: string;
  from?: string;
  to?: string;
  city?: string;
}

export function useOrders(filter: FilterParams, page: number, limit: number = 5, refreshTrigger: number = 0) {
  const [orders, setOrders] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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

        const res = await fetch(`http://localhost:5001/orders/filter?${params.toString()}`);
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
    
  }, [filter.status, filter.from, filter.to, filter.city, page, limit, refreshTrigger]);

  return { orders, meta, isLoading, error };
}