"use client";

import { supabase } from '@/config/supabase';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [metrics, setMetrics] = useState({
    total_orders: 0,
    total_revenue: 0,
    revenue_at_risk: 0,
    otif_percentage: 0
  });

  // Thêm state loading để tối ưu UX trong lần gọi API đầu tiên
  const [isLoading, setIsLoading] = useState(true);

  const fetchMetrics = async () => {
    const { data, error } = await supabase.rpc('get_dashboard_metrics');
    
    if (error) {
      console.error("Lỗi khi lấy dữ liệu dashboard:", error);
      return;
    }
    
    if (data && data.length > 0) {
      setMetrics(data[0]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    // Gọi API lần đầu ngay khi component mount
    fetchMetrics();
    
    // Thiết lập polling mỗi 5 giây
    const intervalId = setInterval(fetchMetrics, 5000);
    
    // Dọn dẹp interval khi component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Tổng quan Dashboard</h2>
      
      {isLoading ? (
        <div className="flex items-center justify-center p-10">
          <p className="text-gray-500 animate-pulse">Đang tải dữ liệu...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card Tổng đơn */}
          <div className="p-5 border rounded-xl shadow-sm bg-white">
            <h3 className="text-gray-500 text-sm font-medium mb-1">Tổng đơn</h3>
            <p className="text-2xl font-bold">{metrics.total_orders}</p>
          </div>

          {/* Card Tổng doanh thu */}
          <div className="p-5 border rounded-xl shadow-sm bg-white">
            <h3 className="text-gray-500 text-sm font-medium mb-1">Tổng doanh thu</h3>
            {/* Sử dụng toLocaleString() để format tiền tệ (VD: 1,000,000) */}
            <p className="text-2xl font-bold">${metrics.total_revenue.toLocaleString()}</p>
          </div>

          {/* Card Doanh thu rủi ro */}
          <div className="p-5 border rounded-xl shadow-sm bg-white">
            <h3 className="text-gray-500 text-sm font-medium mb-1">Doanh thu rủi ro</h3>
            <p className="text-2xl font-bold text-red-600">${metrics.revenue_at_risk.toLocaleString()}</p>
          </div>

          {/* Card Chỉ số OTIF */}
          <div className="p-5 border rounded-xl shadow-sm bg-white">
            <h3 className="text-gray-500 text-sm font-medium mb-1">Chỉ số OTIF</h3>
            <p className="text-2xl font-bold text-blue-600">{metrics.otif_percentage}%</p>
          </div>
        </div>
      )}
    </div>
  );
}