"use client";

import { useState, useEffect } from "react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { socket } from "@/lib/socket"; 
import DashboardFilter from "@/components/dashboard/orders/DashboardFilter";
import KpiCards from "@/components/dashboard/orders/KpiCards";
import OrderLineChart from "@/components/dashboard/orders/OrderLineChart";
import OrderStatusPieChart from "@/components/dashboard/orders/OrderStatusPieChart";
import LiveAlertFeed from "@/components/dashboard/alert/LiveAlertFeed";

export default function DashboardPage() {

  const [filter, setFilter] = useState({
    status: "",
    from: "2026-03-01", 
    to: "2026-03-31",
    city: "", 
  });

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { stats, isLoading, error } = useDashboardStats(filter, refreshTrigger);


  useEffect(() => {
    socket.connect();

    socket.on("ORDER_UPDATED", () => {
      setRefreshTrigger((prev) => prev + 1); 
    });

    return () => {
      socket.off("ORDER_UPDATED");
      socket.disconnect();
    };
  }, []);

  const handleFilterChange = (newFilter: any) => {
    setFilter((prev) => ({ ...prev, ...newFilter }));
  };

  return (
    <div className="max-w-350 mx-auto p-6 space-y-6 bg-gray-50 min-h-screen font-sans">
      
      {/* HEAD */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Operation Analysis Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time metrics and operational performance tracking.
          </p>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-green-700 font-medium bg-green-100 px-3 py-1.5 rounded-full border border-green-200 shadow-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
          Live Sync Active
        </div>
      </div>

      {/* FILTER --- */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <DashboardFilter filter={filter} onChange={handleFilterChange} />
      </div>

      {/* KPI Cards --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCards stats={stats} isLoading={isLoading} error={error} />
      </div>

      {/* MIDDLE: Charts --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Trend (Line chart - Orders over time) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col h-112.5">
           <h2 className="text-lg font-bold text-gray-800 mb-6">Orders Trend Over Time</h2>
           <div className="flex-1 min-h-0">
             <OrderLineChart chartData={stats?.trendData || []} isLoading={isLoading} />
           </div>
        </div>

        {/* Status Distribution (Pie chart) */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col h-112.5">
           <h2 className="text-lg font-bold text-gray-800 mb-6">Status Distribution</h2>
           <div className="flex-1 min-h-0 flex items-center justify-center">
             <OrderStatusPieChart pieData={stats?.statusData || []} isLoading={isLoading} />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2">
            <LiveAlertFeed />
        </div>
      </div>

      {/* --- KHU VỰC MỞ RỘNG TƯƠNG LAI --- */}
      {/* Khi bỏ Table đi, chúng ta dư một khoảng không gian rất đẹp phía dưới. 
          Sau này nếu muốn phân tích sâu hơn, bạn có thể nhét thêm Bar Chart hoặc Map vào đây. 
          Mình để sẵn khung placeholder đứt nét để bạn dễ hình dung: */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="bg-white p-6 rounded-xl border border-gray-300 border-dashed h-72 flex items-center justify-center text-gray-400 font-medium">
            [Future Concept] Top 5 Cities by Order Volume (Bar Chart)
         </div>
         <div className="bg-white p-6 rounded-xl border border-gray-300 border-dashed h-72 flex items-center justify-center text-gray-400 font-medium">
            [Future Concept] Average Lead Time Trend (Area Chart)
         </div>
      </div> 
      */}

    </div>
  );
}