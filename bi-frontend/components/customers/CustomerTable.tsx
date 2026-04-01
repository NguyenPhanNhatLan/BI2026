"use client"
import { useState } from "react";
import { ChevronLeft, ChevronRight, Eye, Trash2 } from "lucide-react";
import useCustomers from "@/hooks/useCustomer";
import { toast } from "sonner";

interface CustomerTableProps {
    filter: any;
    refreshTrigger: number;
    onRefresh: () => void;
}

export default function CustomerTable({ filter, refreshTrigger, onRefresh }: CustomerTableProps) {
    const [page, setPage] = useState(1);
    const limit = 10;

    const [detailCustomerModal, setDetailCustomerModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

    const { customers, meta, isLoading, error } = useCustomers(
        filter,
        page,
        limit,
        refreshTrigger
    );

    const handleCustomerViewDetail = (customer: any) => {
        setSelectedCustomer(customer);
        setDetailCustomerModal(true);
    };

    const handleDelete = async (customerId: string) => {
        // SỬA TẠI ĐÂY: Nếu KHÔNG confirm (!) thì mới return.
        if (!window.confirm(`Xoá vĩnh viễn khách hàng ${customerId}?`)) return;

        try {
            const res = await fetch(`http://localhost:5001/customers/${customerId}`, {
                method: "DELETE"
            });
            const data = await res.json();

            if (data.success) {
                toast.success("Xóa thành công!");

                if (customers.length === 1 && page > 1) {
                    setPage((p) => p - 1);
                } else {
                    onRefresh();
                }
            } else {
                toast.error(data.message || "Xóa thất bại");
            }
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Lỗi kết nối server");
        }
    };

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase font-semibold">
                        <tr>
                            <th className="px-6 py-4">Customer ID</th>
                            <th className="px-6 py-4">Customer Name</th>
                            <th className="px-6 py-4">City</th>
                            <th className="px-6 py-4 text-center">On-time target</th>
                            <th className="px-6 py-4 text-center">In-full target</th>
                            <th className="px-6 py-4 text-center">OTIF target</th>
                            <th className="px-6 py-4 text-center">Delete</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100 text-sm">
                        {isLoading ? (
                            <tr>
                                <td colSpan={4} className="text-center py-10">
                                    <span className="animate-pulse">Loading...</span>
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-10 text-center text-red-500">
                                    {error}
                                </td>
                            </tr>
                        ) : !customers || customers.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-10 text-center text-gray-400 font-medium">
                                    Customer not found!
                                </td>
                            </tr>
                        ) : (
                            customers.map((customer) => (
                                <tr
                                    key={customer.customer_id}
                                    className="hover:bg-gray-50 transition group"
                                >
                                    <td className="px-6 py-4 font-mono text-gray-600 font-medium">
                                        #{customer.customer_id?.substring(0, 8)}
                                    </td>

                                    <td className="px-6 py-4 font-semibold text-gray-800">
                                        {customer.customer_name}
                                    </td>

                                    <td className="px-6 py-4 font-semibold text-gray-800">
                                        {customer.city}
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-gray-800">
                                        {customer.target.ontime}
                                    </td>

                                    <td className="px-6 py-4 font-semibold text-gray-800">
                                        {customer.target.infull}
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-gray-800">
                                        {customer.target.otif}
                                    </td>


                                    <td className="px-6 py-4 flex justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleDelete(customer.customer_id)}
                                            className="text-red-500 hover:text-red-700 transition"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                    Page <span className="font-semibold">{page}</span> /{" "}
                    <span className="font-semibold">
                        {meta?.totalPages || 1}
                    </span>
                </span>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1 || isLoading}
                        className="px-3 py-1.5 border rounded-lg bg-white disabled:opacity-50 hover:bg-gray-50"
                    >
                        <ChevronLeft size={16} />
                    </button>

                    <button
                        onClick={() =>
                            setPage((p) =>
                                Math.min(meta?.totalPages || 1, p + 1)
                            )
                        }
                        disabled={page >= (meta?.totalPages || 1) || isLoading}
                        className="px-3 py-1.5 border rounded-lg bg-white disabled:opacity-50 hover:bg-gray-50"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}