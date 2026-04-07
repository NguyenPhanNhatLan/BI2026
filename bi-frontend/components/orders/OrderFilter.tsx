"use client";

import { X } from "lucide-react";

export interface OrderFilterState {
    from: string;
    to: string;
    status: string;
    city: string;
}

interface OrderFilterProps {
    filter: OrderFilterState;
    onChange: (newFilter: Partial<OrderFilterState>) => void;
}

export default function OrderFilter({ filter, onChange }: OrderFilterProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        onChange({ [name]: value });
    };

    const handleClearFilters = () => {
        onChange({
            from: "",
            to: "",
            status: "",
            city: "",
        });
    };

    const hasActiveFilters =
        filter.from || filter.to || filter.status || filter.city;

    return (
        <div className="p-4 rounded-2xl shadow-sm border border-gray-100">
            
            <div className="flex flex-row items-end justify-between gap-6 flex-wrap">
        
                <div className="flex flex-col">
                    <label className="text-xl font-medium text-gray-500 mb-1">
                        Trạng thái
                    </label>
                    <select
                        name="status"
                        value={filter.status}
                        onChange={handleChange}
                        className=" px-3 border border-gray-200 rounded-sm text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    >
                        <option value="">Tất cả</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>


                <div className="flex flex-col p-5">
                    <label className="text-xl font-medium text-gray-500 mb-1">
                        Thành phố
                    </label>
                    <input
                        type="text"
                        name="city"
                        value={filter.city}
                        onChange={handleChange}
                        placeholder="Hồ Chí Minh..."
                        className="h-10 px-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                </div>

                {/* Từ ngày */}
                <div className="flex flex-col">
                    <label className="text-xl font-medium text-gray-500 mb-1">
                        Từ ngày
                    </label>
                    <input
                        type="date"
                        name="from"
                        value={filter.from}
                        onChange={handleChange}
                        className="h-10 px-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                </div>

                {/* Đến ngày */}
                <div className="flex flex-col">
                    <label className="text-xl font-medium text-gray-500 mb-1">
                        Đến ngày
                    </label>
                    <input
                        type="date"
                        name="to"
                        value={filter.to}
                        onChange={handleChange}
                        className="h-10 px-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                </div>

                <div className="flex items-end">
                    {hasActiveFilters && (
                        <button
                            onClick={handleClearFilters}
                            className="w-full h-10 flex items-center justify-center gap-2 text-sm font-medium text-gray-500 hover:text-red-600 bg-gray-50 hover:bg-red-50 border border-gray-200 hover:border-red-200 rounded-xl transition"
                        >
                            <X size={16} />
                            Xóa bộ lọc
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}