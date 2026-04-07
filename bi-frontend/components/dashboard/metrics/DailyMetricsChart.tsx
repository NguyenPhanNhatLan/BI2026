"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";
import { useEffect, useState } from "react";
import { supabase } from "@/config/supabase";

export default function DailyMetricsChart() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchTrend = async () => {
      const { data, error } = await supabase.rpc(
        "get_dashboard_metrics_by_day"
      );

      if (!error) setData(data);
    };

    fetchTrend();
  }, []);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border mt-6">
      <h2 className="text-lg font-semibold mb-4">
        📈 Revenue & Risk Trend
      </h2>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>

              <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="order_date" />
            <YAxis />

            <Tooltip />

            <Area
              type="monotone"
              dataKey="total_revenue"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorRevenue)"
              name="Revenue"
            />

            <Area
              type="monotone"
              dataKey="revenue_at_risk"
              stroke="#f43f5e"
              fillOpacity={1}
              fill="url(#colorRisk)"
              name="Risk"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}