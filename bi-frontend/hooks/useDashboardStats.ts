import { useState, useEffect } from "react";

export function useDashboardStats(filter: { status: string; from: string; to: string; }, refreshTrigger: number) {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Tạo chuỗi query string từ object filter. 
        // URLSearchParams sẽ tự động bỏ qua các giá trị rỗng nếu ta cấu hình đúng.
        const params = new URLSearchParams();
        if (filter.status) params.append("status", filter.status);
        if (filter.from) params.append("from", filter.from);
        if (filter.to) params.append("to", filter.to);

        // Gọi API backend (nhớ đổi port 5001 thành port thực tế của bạn nếu khác)
        const res = await fetch(`http://localhost:5001/orders/summary?${params.toString()}`);
        
        if (!res.ok) throw new Error("Failed to fetch dashboard stats");
        
        const json = await res.json();
        if (json.success) {
          setStats(json.data);
        } else {
          throw new Error(json.message);
        }
      } catch (err: any) {
        console.error("Dashboard fetch error:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
    
    // Ở đây sau này chúng ta có thể chèn logic gọi lại (Polling) 
    // hoặc trigger từ Socket.io để realtime
  }, [filter.status, filter.from, filter.to]); // Chạy lại hàm fetch khi 1 trong 3 giá trị này đổi

  return { stats, isLoading, error };
}