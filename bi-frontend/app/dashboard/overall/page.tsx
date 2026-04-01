'use client';

import { useState, useEffect, useCallback } from 'react';

interface HeroKPIs {
  otif_rate: number | null;
  on_time_rate: number | null;
  in_full_rate: number | null;
  total_revenue_risk: number | null;
  total_revenue: number | null;
  target_on_time: number | null;
  target_in_full: number | null;
  target_otif: number | null;
}

interface MissingProduct {
  product_name: string;
  order_qty: number;
  delivery_qty: number;
  missing_qty: number;
}

interface DashboardData {
  heroKPIs: HeroKPIs;
  topMissingProducts: MissingProduct[];
}

interface KPIProps {
  title: string;
  value: number | null;
  target?: number | null;
  isMoney?: boolean;
  danger?: boolean;
}

export default function ControlTowerDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5001/dashboard/otif-summary');
      const result = await res.json();
      if (result.success) setData(result.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <div className="p-10 text-gray-500 font-medium">Loading...</div>;
  if (!data) return <div className="p-10 text-red-500 font-medium">No data available</div>;

  const kpi = data.heroKPIs;

  return (
    <div className="bg-[#f5f7fb] min-h-screen p-8 space-y-8 font-sans">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">OTIF Monitoring</h1>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6 mt-6 w-full">
        <KPI title="OTIF" value={kpi.otif_rate} target={kpi.target_otif} />
        <KPI title="On-Time" value={kpi.on_time_rate} target={kpi.target_on_time} />
        <KPI title="In-Full" value={kpi.in_full_rate} target={kpi.target_in_full} />
      </div>
      <div>
        <RevenueKPI total_revenue={kpi.total_revenue} revenue_risk={kpi.total_revenue_risk} />
      </div>

      {/* ===== MAIN AREA ===== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

        {/* CHART PLACEHOLDER (BIG AREA) */}
        <div className="xl:col-span-9 bg-white rounded-2xl p-6 mt-6 shadow-sm border border-gray-100 min-h-100 flex flex-col">
          <h2 className="font-semibold text-gray-800 mb-4">OTIF Trend</h2>
          <div className="flex-1 w-full flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 bg-gray-50/50 rounded-xl">
            Chart will be here
          </div>
        </div>

        {/* RIGHT SIDE PANEL */}
        <div className="xl:col-span-3 flex flex-col gap-6">

          {/* STATUS */}
          <div className="bg-gray-900 text-white rounded-2xl p-6 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-400">System Status</div>
            <div className="text-xl font-bold mt-2 text-emerald-400 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Stable
            </div>
            <div className="text-xs text-gray-400 mt-1">All operations normal</div>
          </div>


          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex-1">
            <h2 className="font-semibold text-gray-800 mb-4">Alerts</h2>
            <ul className="text-sm text-gray-600 space-y-3">
              <li className="flex items-start gap-2 bg-red-50 text-red-700 p-2.5 rounded-lg border border-red-100">
                <span>⚠</span>
                <span className="font-medium">OTIF below target</span>
              </li>
              <li className="flex items-start gap-2 bg-orange-50 text-orange-700 p-2.5 rounded-lg border border-orange-100">
                <span>⚠</span>
                <span className="font-medium">Revenue at risk increasing</span>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}

function KPI({ title, value, target, isMoney, danger }: KPIProps) {
  const numeric = value ?? 0;

  const formatted = isMoney
    ? `$${numeric.toLocaleString()}`
    : `${numeric}%`;

  const isBad = target != null && numeric < target;


  const trend = Math.random() * 10 - 5;
  const isUp = trend >= 0;

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col justify-between min-h-30 transition-transform hover:-translate-y-1 duration-200">

      {/* NHÓM 1: Tiêu đề và Con số*/}
      <div className="flex flex-col mb-2 gap-1">
        <div className="text-xl font-bold text-gray-400 uppercase tracking-wider">
          {title}
        </div>
        <div className={`text-xl font-sans font-bold tracking-tight ${danger ? 'text-red-500' : 'text-gray-800'}`}>
          {formatted}
        </div>
      </div>

      {/* NHÓM 2: Footer */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
        <div className={`text-sm font-bold flex items-center gap-1 ${isUp ? 'text-emerald-500' : 'text-red-500'}`}>
          {isUp ? '▲' : '▼'} {Math.abs(trend).toFixed(1)}%
        </div>

        {target != null && (
          <div className={`text-xs font-bold px-2.5 py-1 rounded-md ${isBad ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
            Target: {target}%
          </div>
        )}
      </div>

    </div>
  );
}

function RevenueKPI({total_revenue, revenue_risk}: {total_revenue?: number | null, revenue_risk?: number | null}) {
  return (
    <div className='bg-[#f5f7fb] w-full max-w-md mt-6 h-fit p-6 rounded-xl shadow-sm border border-gray-200 font-sans'>

      <div className='flex flex-row justify-between items-center w-full'>
        <div>
          <div className='font-semibold text-xl text-gray-800'>Total Revenue</div>
          <div className='text-2xl font-bold text-gray-800'>${total_revenue?.toLocaleString() ?? '0'}</div>
        </div>
        <div>
          <div className='font-semibold text-xl text-red-500'>Revenue Risk</div>
          <div className='text-2xl font-bold text-red-500'>${revenue_risk?.toLocaleString() ?? '0'}</div>
        </div>
      </div>

    </div>
  )
}
