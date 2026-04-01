"use client";

import { Search, Calendar, MapPin } from "lucide-react";

interface DashboardFilterProps {
  filter: {
    status: string;
    from: string;
    to: string;
    city: string; // Đã thêm trường City
  };
  onChange: (newFilter: any) => void;
}

export default function DashboardFilter({ filter, onChange }: DashboardFilterProps) {
  return (
    <div className="flex flex-col md:flex-row items-center gap-4">
      {/* 1. Bộ chọn ngày bắt đầu */}
      <div className="w-full md:w-1/4 relative flex items-center">
        <span className="text-sm text-gray-500 mr-2 font-medium w-10">From:</span>
        <div className="relative flex-1">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="date"
              value={filter.from}
              onChange={(e) => onChange({ from: e.target.value })}
              className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-700"
            />
        </div>
      </div>

      {/* 2. Bộ chọn ngày kết thúc */}
      <div className="w-full md:w-1/4 relative flex items-center">
        <span className="text-sm text-gray-500 mr-2 font-medium w-10">To:</span>
        <div className="relative flex-1">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="date"
              value={filter.to}
              onChange={(e) => onChange({ to: e.target.value })}
              className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-700"
            />
        </div>
      </div>

      {/* 3. Bộ chọn trạng thái */}
      <div className="w-full md:w-1/4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <select
          value={filter.status}
          onChange={(e) => onChange({ status: e.target.value })}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-gray-50 text-gray-700 font-medium cursor-pointer"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* 4. Bộ lọc Thành phố (Mới) */}
      <div className="w-full md:w-1/4 relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Filter by City..."
          value={filter.city}
          onChange={(e) => onChange({ city: e.target.value })}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-700"
        />
      </div>
    </div>
  );
}