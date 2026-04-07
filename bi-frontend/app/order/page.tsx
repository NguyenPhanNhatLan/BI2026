"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import DashboardFilter from "@/components/dashboard/orders/DashboardFilter";
import OrderTable from "@/components/dashboard/orders/OrderTable";

export default function OrderPage() {
    const router = useRouter();

    const [filter, setFilter] = useState({
        from: "2022-01-01",
        to: "2022-12-31",
        status: "pending",
        city: "",
    });

    const handleFilterChange = (newFilter: any) => {
        setFilter((prev) => ({ ...prev, ...newFilter }));
    };

    return (
        <div className="max-w-350 mx-auto p-6 space-y-6 bg-gray-50 min-h-screen font-sans">

            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    Order Management
                </h1>
                <button
                    onClick={() => router.push('/order/create')}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm font-medium"
                >
                    <Plus size={18} />
                    Add Order
                </button>
            </div>
=
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <DashboardFilter filter={filter} onChange={handleFilterChange} />
            </div>

            {/* --- TABLE SECTION --- */}
            {/* Mình bọc thêm một lớp thẻ div để bảng có viền bo tròn, bóng đổ giống trang Product */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                <div className="px-6 py-5 border-b border-gray-100 bg-white">
                    <h2 className="text-lg font-bold text-gray-800">Order List</h2>
                </div>
                
                <div className="flex-1 overflow-x-auto">
                    <OrderTable filter={filter} />
                </div>
            </div>

        </div>
    );
}