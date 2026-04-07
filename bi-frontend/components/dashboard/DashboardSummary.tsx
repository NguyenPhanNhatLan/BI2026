"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { DollarSign, Package, AlertTriangle, CheckCircle } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DashboardSummary() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      const { data, error } = await supabase.rpc("get_dashboard_metrics");
      
      if (error) {
        console.error("Lỗi khi gọi RPC:", error);
      } else if (data && data.length > 0) {
        setMetrics(data[0]); 
      }
      setLoading(false);
    }

    fetchMetrics();
  }, []);

  if (loading) return <div className="p-4">Đang tải dữ liệu tổng quan...</div>;
  if (!metrics) return <div className="p-4 text-red-500">Không có dữ liệu</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Tổng Doanh Thu</p>
            <h3 className="text-2xl font-bold">${metrics.total_revenue?.toLocaleString()}</h3>
            <p className="text-sm text-green-600 mt-1">
              Lợi nhuận: ${metrics.total_profit?.toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-green-100 rounded-full text-green-600"><DollarSign /></div>
        </div>
      </div>

    
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Tổng Đơn Hàng</p>
            <h3 className="text-2xl font-bold">{metrics.total_orders?.toLocaleString()}</h3>
            <p className="text-sm text-gray-600 mt-1">
              Fulfillment: {metrics.fulfillment_rate}%
            </p>
          </div>
          <div className="p-3 bg-blue-100 rounded-full text-blue-600"><Package /></div>
        </div>
      </div>

  
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Tỷ lệ OTIF</p>
            <h3 className="text-2xl font-bold text-indigo-600">{metrics.otif_percentage}%</h3>
            <p className="text-sm text-gray-600 mt-1">
              {metrics.otif_orders} đơn đạt chuẩn
            </p>
          </div>
          <div className="p-3 bg-indigo-100 rounded-full text-indigo-600"><CheckCircle /></div>
        </div>
      </div>

 
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Doanh thu Rủi ro (Risk)</p>
            <h3 className="text-2xl font-bold text-red-600">${metrics.revenue_at_risk?.toLocaleString()}</h3>
            <p className="text-sm text-red-500 mt-1">
              Chiếm {metrics.risk_percentage}% / {metrics.overdue_orders} đơn trễ
            </p>
          </div>
          <div className="p-3 bg-red-100 rounded-full text-red-600"><AlertTriangle /></div>
        </div>
      </div>
    </div>
  );
}