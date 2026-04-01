"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface OrderStatusPieChartProps {
  pieData: any[]; // Dữ liệu dạng: [{ name: 'completed', value: 120 }, { name: 'pending', value: 45 }]
  isLoading: boolean;
}

// Map màu sắc cho từng trạng thái
const STATUS_COLORS: Record<string, string> = {
  completed: "#10B981", // Xanh lá
  pending: "#F59E0B",   // Vàng cam
  processing: "#3B82F6", // Xanh dương
  cancelled: "#EF4444",  // Đỏ
  default: "#9CA3AF",    // Xám
};

export default function OrderStatusPieChart({ pieData, isLoading }: OrderStatusPieChartProps) {
  if (isLoading) {
    return (
      <div className="w-full h-full min-h-75 bg-gray-50 rounded-xl animate-pulse flex items-center justify-center border border-gray-100">
        <div className="w-40 h-40 rounded-full border-8 border-gray-200"></div>
      </div>
    );
  }

  if (!pieData || pieData.length === 0) {
    return (
      <div className="w-full h-full min-h-75 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
        <span className="text-gray-400 font-medium">Chưa có phân bổ trạng thái</span>
      </div>
    );
  }

  // Custom hiển thị tên hiển thị cho đẹp
  const formatName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-lg">
          <p className="text-gray-800 font-bold mb-1 capitalize">{data.name}</p>
          <p className="text-gray-600 font-medium">
            Số lượng: <span className="text-gray-900">{data.value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={70} // Tạo khoảng trống ở giữa thành biểu đồ Donut
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={STATUS_COLORS[entry.name.toLowerCase()] || STATUS_COLORS.default} 
              />
            ))}
          </Pie>
          
          <Tooltip content={<CustomTooltip />} />
          
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            formatter={(value) => <span className="text-gray-600 font-medium ml-1">{formatName(value)}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}