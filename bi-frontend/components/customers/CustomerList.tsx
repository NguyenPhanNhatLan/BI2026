"use client";
import { StepBack, StepForward } from "lucide-react";
import { useEffect, useState } from "react";

export default function CustomerList() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCustomers = async () => {
            setIsLoading(true);
            setError(null); 
            
            try {
                const res = await fetch(
                    `http://localhost:5001/customers?page=${page}&limit=10`
                );
                
                if (!res.ok) {
                    throw new Error(`HTTP error! Status: ${res.status}`);
                }
                
                const data = await res.json();
                setCustomers(data.data || []);
            } catch (err: any) {
                console.error("Fetch error:", err);
                setError("Không thể tải danh sách khách hàng. Vui lòng kiểm tra lại server.");
                setCustomers([]); 
            } finally {
                setIsLoading(false);
            }
        };
        fetchCustomers();
    }, [page]);

    return (
        <div className="max-w-3xl mx-auto mt-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
                Customer List
            </h2>

            <div className="bg-white shadow-lg rounded-2xl border overflow-hidden">
                <div className="grid grid-cols-[50px_1fr_1fr] gap-4 px-4 py-3 bg-gray-50 border-b font-bold text-gray-600 text-sm uppercase tracking-wider">
                    <div>#</div>
                    <div>Customer Name</div>
                    <div className="text-right">City</div>
                </div>

                <div className="max-h-87.5 overflow-y-auto">
                    {isLoading ? (
                        <div className="p-8 text-center text-gray-500 font-medium">
                            Đang tải dữ liệu...
                        </div>
                    ) : error ? (
                        <div className="p-8 text-center text-red-500 font-medium">
                            {error}
                        </div>
                    ) : customers?.length > 0 ? (
                        customers.map((c, index) => (
                            <div
                                key={c.customer_id}
                                className="grid grid-cols-[50px_1fr_1fr] gap-4 px-4 py-3 border-b last:border-none hover:bg-gray-50 transition cursor-pointer items-center"
                                onClick={() => console.log("click customer", c)}
                            >
                                <div className="text-sm font-semibold text-gray-500">
                                    {(page - 1) * 10 + index + 1}
                                </div>
                                <div className="font-medium text-gray-800 truncate">
                                    {c.customer_name}
                                </div>
                                <div className="text-sm text-gray-500 text-right truncate">
                                    {c.city}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-gray-400 font-medium">
                            No customers found.
                        </div>
                    )}
                </div>
            </div>


            <div className="flex items-center justify-center gap-4 mt-5">
                <button
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                    disabled={page === 1 || isLoading}
                    className="p-2 rounded-lg border bg-white hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-white transition shadow-sm"
                >
                    <StepBack size={20} className="text-gray-600" />
                </button>

                <span className="font-medium text-gray-700 min-w-20 text-center">
                    Page {page}
                </span>

                <button
                    onClick={() => setPage(prev => prev + 1)}
                    disabled={isLoading || customers.length < 10}
                    className="p-2 rounded-lg border bg-white hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-white transition shadow-sm"
                >
                 <StepForward size={20} className="text-gray-600" />
                </button>
            </div>
        </div>
    );
}