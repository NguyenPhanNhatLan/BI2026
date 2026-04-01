"use client";

import { ShoppingBag, Clock, CheckCircle2, Timer } from "lucide-react";

interface KpiCardsProps {
  stats: any;
  isLoading: boolean;
  error: string | null;
}

export default function KpiCards({ stats, isLoading, error }: KpiCardsProps) {
  // 1. Trạng thái Loading (4 khối Skeleton)
  if (isLoading) {
    return (
      <>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-5 animate-pulse">
            <div className="w-14 h-14 bg-gray-100 rounded-full shrink-0"></div>
            <div className="space-y-3 flex-1">
              <div className="h-4 bg-gray-100 rounded w-1/2"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </>
    );
  }

  // 2. Trạng thái Lỗi
  if (error) {
    return (
      <div className="col-span-1 md:col-span-2 lg:col-span-4 text-red-500 p-4 bg-red-50 rounded-xl border border-red-100 text-sm font-medium">
        Lỗi tải số liệu KPI: {error}
      </div>
    );
  }

  // 3. Render Dữ liệu thực tế
  const summary = stats?.summary || {};
  const totalOrders = summary.totalOrders || 0;
  const pendingOrders = summary.totalPending || 0;
  const completedOrders = summary.totalCompleted || 0;
  const avgProcessingTime = summary.avgProcessingTime || 0; 

  return (
    <>
      {/* Card 1: Total Orders */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5 transition hover:shadow-md">
        <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
          <ShoppingBag size={28} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">Total Orders</p>
          <h3 className="text-2xl font-bold text-gray-800">{totalOrders.toLocaleString()}</h3>
        </div>
      </div>

      {/* Card 2: Pending Orders */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5 transition hover:shadow-md">
        <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center shrink-0">
          <Clock size={28} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">Pending</p>
          <h3 className="text-2xl font-bold text-gray-800">{pendingOrders.toLocaleString()}</h3>
        </div>
      </div>

      {/* Card 3: Completed Orders */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5 transition hover:shadow-md">
        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
          <CheckCircle2 size={28} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">Completed</p>
          <h3 className="text-2xl font-bold text-gray-800">{completedOrders.toLocaleString()}</h3>
        </div>
      </div>

      {/* Card 4: Avg Processing Time */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5 transition hover:shadow-md">
        <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center shrink-0">
          <Timer size={28} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">Avg Order Lead Time</p>
          <h3 className="text-2xl font-bold text-gray-800">
            {avgProcessingTime > 0 ? `${avgProcessingTime.toFixed(1)} hrs` : 'N/A'}
          </h3>
        </div>
      </div>
    </>
  );
}