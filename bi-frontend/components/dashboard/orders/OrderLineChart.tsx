"use client";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

interface OrderLineChartProps {
    chartData: any[];
    isLoading: boolean;
}

export default function OrderLineChart({ chartData, isLoading }: OrderLineChartProps) {
    // Trạng thái Loading
    if (isLoading) {
        return (
            <div className="w-full h-full min-h-75 bg-gray-50 rounded-xl animate-pulse flex items-center justify-center border border-gray-100">
                <span className="text-gray-400 font-medium">Đang vẽ biểu đồ xu hướng...</span>
            </div>
        );
    }

    // Trạng thái trống
    if (!chartData || chartData.length === 0) {
        return (
            <div className="w-full h-full min-h-75 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
                <span className="text-gray-400 font-medium">Không có dữ liệu đơn hàng</span>
            </div>
        );
    }

    // Custom Tooltip khi hover chuột
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-lg">
                    <p className="text-gray-600 font-medium mb-1">{label}</p>
                    <p className="text-blue-600 font-bold">
                        Số đơn: {payload[0].value.toLocaleString()}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />

                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                        dy={10}
                    />

                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                    />

                    <Tooltip content={<CustomTooltip />} />

                    <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}