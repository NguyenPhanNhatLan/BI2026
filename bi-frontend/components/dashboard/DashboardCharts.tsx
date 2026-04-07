"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Area
} from "recharts";
import { Filter, CalendarDays } from "lucide-react";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DashboardCharts() {
    const [rawData, setRawData] = useState<any[]>([]);
    const [chartData, setChartData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [fromDate, setFromDate] = useState<string>("");
    const [toDate, setToDate] = useState<string>("");
    const [timeframe, setTimeframe] = useState<"day" | "week" | "month">("day");

    const fetchChartData = async () => {
        setLoading(true);

        const fromDateParam = fromDate ? `${fromDate}T00:00:00Z` : null;
        const toDateParam = toDate ? `${toDate}T23:59:59Z` : null;

        const { data, error } = await supabase.rpc("get_dashboard_metrics_by_day", {
            from_date: fromDateParam,
            to_date: toDateParam,
        });

        if (error) {
            console.error("Lỗi khi gọi RPC by day:", error);
        } else if (data) {
            const formattedData = data.map((item: any) => ({
                order_date: item.order_date,
                total_revenue: Number(item.total_revenue || 0),
                total_profit: Number(item.total_profit || 0),
                revenue_at_risk: Number(item.revenue_at_risk || 0),
                otif_percentage: Number(item.otif_percentage || 0),
                risk_percentage: Number(item.risk_percentage || 0),
                total_orders: Number(item.total_orders || 0),
                overdue_orders: Number(item.overdue_orders || 0),
            }));
            setRawData(formattedData);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchChartData();
    }, []);

    useEffect(() => {
        if (!rawData.length) {
            setChartData([]);
            return;
        }

        const groupedMap: Record<string, any> = {};

        rawData.forEach((item) => {
            let key = item.order_date;
            let displayDate = "";

            const d = new Date(item.order_date);

            if (timeframe === "day") {
                displayDate = d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
            } else if (timeframe === "week") {
                const day = d.getUTCDay();
                const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
                const startOfWeek = new Date(d);
                startOfWeek.setUTCDate(diff);

                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setUTCDate(startOfWeek.getUTCDate() + 6);

                key = startOfWeek.toISOString().split("T")[0];
                displayDate = `${startOfWeek.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })} - ${endOfWeek.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}`;
            } else if (timeframe === "month") {
                key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
                displayDate = `T${d.getUTCMonth() + 1}/${d.getUTCFullYear()}`;
            }

            if (!groupedMap[key]) {
                groupedMap[key] = {
                    key,
                    displayDate,
                    total_revenue: 0,
                    total_profit: 0,
                    total_orders: 0,
                    overdue_orders: 0,
                    revenue_at_risk: 0,
                    otif_orders_count: 0,
                };
            }

            groupedMap[key].total_revenue += item.total_revenue;
            groupedMap[key].total_profit += item.total_profit;
            groupedMap[key].total_orders += item.total_orders;
            groupedMap[key].overdue_orders += item.overdue_orders;
            groupedMap[key].revenue_at_risk += item.revenue_at_risk;
            groupedMap[key].otif_orders_count += item.total_orders * (item.otif_percentage / 100);
        });

        const processedData = Object.values(groupedMap).map((g: any) => {
            const risk_percentage = g.total_revenue ? (g.revenue_at_risk / g.total_revenue) * 100 : 0;
            const otif_percentage = g.total_orders ? (g.otif_orders_count / g.total_orders) * 100 : 0;

            return {
                ...g,
                risk_percentage: Number(risk_percentage.toFixed(2)),
                otif_percentage: Number(otif_percentage.toFixed(2)),
                sma_otif: Number(otif_percentage.toFixed(2)),
                sma_risk: Number(risk_percentage.toFixed(2))
            };
        }).sort((a, b) => new Date(a.key).getTime() - new Date(b.key).getTime());

        if (timeframe === "day") {
            const windowSize = 7;
            const smoothedData = processedData.map((item, index, arr) => {
                const start = Math.max(0, index - windowSize + 1);
                const subset = arr.slice(start, index + 1);

                const getAverage = (key: string) => {
                    const sum = subset.reduce((acc, curr) => acc + curr[key], 0);
                    return Number((sum / subset.length).toFixed(2));
                };

                return {
                    ...item,
                    sma_otif: getAverage("otif_percentage"),
                    sma_risk: getAverage("risk_percentage"),
                };
            });
            setChartData(smoothedData);
        } else {
            setChartData(processedData);
        }

    }, [rawData, timeframe]);

    return (
        <div className="flex flex-col gap-6">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap justify-between items-end gap-4">

                <div className="flex flex-wrap items-end gap-4">
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-600 mb-1">Từ ngày</label>
                        <input
                            type="date"
                            className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-600 mb-1">Đến ngày</label>
                        <input
                            type="date"
                            className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={fetchChartData}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:bg-blue-300"
                    >
                        <Filter size={18} />
                        {loading ? "Đang tải..." : "Lọc dữ liệu"}
                    </button>

                    {(fromDate || toDate) && (
                        <button
                            onClick={() => {
                                setFromDate("");
                                setToDate("");
                            }}
                            className="text-gray-500 hover:text-red-500 px-3 py-2 text-sm transition-colors"
                        >
                            Xóa bộ lọc
                        </button>
                    )}
                </div>

                <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200">
                    <button
                        onClick={() => setTimeframe("day")}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${timeframe === "day" ? "bg-white shadow-sm text-blue-600" : "text-gray-600 hover:text-gray-900"}`}
                    >
                        Theo Ngày
                    </button>
                    <button
                        onClick={() => setTimeframe("week")}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${timeframe === "week" ? "bg-white shadow-sm text-blue-600" : "text-gray-600 hover:text-gray-900"}`}
                    >
                        Theo Tuần
                    </button>
                    <button
                        onClick={() => setTimeframe("month")}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${timeframe === "month" ? "bg-white shadow-sm text-blue-600" : "text-gray-600 hover:text-gray-900"}`}
                    >
                        Theo Tháng
                    </button>
                </div>
            </div>

            {loading && chartData.length === 0 ? (
                <div className="p-8 text-center text-gray-500">Đang tải dữ liệu biểu đồ...</div>
            ) : chartData.length === 0 ? (
                <div className="p-8 text-center text-gray-500 bg-white rounded-xl border border-gray-100">
                    Không có dữ liệu trong khoảng thời gian này.
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold mb-4 text-gray-700">Doanh Thu & Lợi Nhuận</h3>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="displayDate" axisLine={false} tickLine={false} minTickGap={timeframe === 'day' ? 30 : 5} />
                                    <YAxis yAxisId="left" axisLine={false} tickLine={false} width={80} />
                                    <Tooltip cursor={{ fill: 'transparent' }} />
                                    <Legend />

                                    {timeframe === "day" ? (
                                        <Bar yAxisId="left" dataKey="total_revenue" name="Doanh Thu ($)" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                    ) : (
                                        <Area yAxisId="left" type="basis" dataKey="total_revenue" name="Doanh Thu ($)" fill="#3B82F6" stroke="#3B82F6" fillOpacity={0.2} strokeWidth={2} />
                                    )}

                                    <Area yAxisId="left" type="basis" dataKey="total_profit" name="Lợi Nhuận ($)" fill="#10B981" stroke="#10B981" fillOpacity={0.3} strokeWidth={2} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold mb-4 text-gray-700">Hiệu suất Vận hành (OTIF vs Risk %)</h3>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="displayDate" axisLine={false} tickLine={false} minTickGap={timeframe === 'day' ? 30 : 5} />
                                    <YAxis axisLine={false} tickLine={false} domain={[0, 100]} width={50} />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="basis" dataKey="sma_otif" name="OTIF (%)" stroke="#6366F1" strokeWidth={3} dot={timeframe !== 'day'} activeDot={{ r: 6 }} />
                                    <Line type="basis" dataKey="sma_risk" name="Rủi ro (%)" stroke="#EF4444" strokeWidth={3} dot={timeframe !== 'day'} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 3. LƯU LƯỢNG ĐƠN HÀNG */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
                        <h3 className="text-lg font-semibold mb-4 text-gray-700">Lưu lượng Đơn hàng</h3>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="displayDate" axisLine={false} tickLine={false} minTickGap={timeframe === 'day' ? 30 : 5} />
                                    <YAxis axisLine={false} tickLine={false} width={50} />
                                    <Tooltip cursor={{ fill: '#F3F4F6' }} />
                                    <Legend />
                                    <Bar dataKey="total_orders" name="Tổng Đơn Hàng" fill="#9CA3AF" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="overdue_orders" name="Đơn Quá Hạn" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}