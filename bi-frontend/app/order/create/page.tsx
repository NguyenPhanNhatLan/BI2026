"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Save, ArrowLeft, Search, User } from "lucide-react";
import CustomerSelectModal from "@/components/customers/CustomerSelectModal";

export default function CreateOrderPage() {
    const router = useRouter();
    const [products, setProducts] = useState<any[]>([]);

    const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

    const [status, setStatus] = useState("pending");
    const [items, setItems] = useState([{ product_id: "", order_qty: 1 }]);

    const [isSubmitting, setIsSubmitting] = useState(false);

    // 3. Tải danh sách Khách hàng và Sản phẩm khi vào trang
    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const resProd = await fetch("http://localhost:5001/products?limit=100");
                if (resProd.ok) {
                    const jsonProd = await resProd.json();
                    setProducts(jsonProd.data || []);
                }
            } catch (error) {
                console.error("Lỗi tải dữ liệu dropdown:", error);
            }
        };
        fetchDropdownData();
    }, []);

    // --- CÁC HÀM XỬ LÝ DYNAMIC FORM ---

    // Thêm 1 dòng sản phẩm mới
    const handleAddItem = () => {
        setItems([...items, { product_id: "", order_qty: 1 }]);
    };

    // Xóa 1 dòng sản phẩm
    const handleRemoveItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };

    // Cập nhật dữ liệu khi người dùng chọn sản phẩm hoặc đổi số lượng trên 1 dòng
    const handleItemChange = (index: number, field: string, value: string | number) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    // Tính tổng tiền đơn hàng (Hiển thị cho đẹp mắt)
    const calculateTotal = () => {
        return items.reduce((total, item) => {
            const product = products.find(p => p.product_id === item.product_id);
            const price = product ? product.price : 0;
            return total + (price * item.order_qty);
        }, 0);
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        // Validate sương sương
        if (!selectedCustomer) return alert("Vui lòng chọn khách hàng!");

        const validItems = items.filter(item => item.product_id !== "" && item.order_qty > 0);
        if (validItems.length === 0) return alert("Vui lòng chọn ít nhất 1 sản phẩm hợp lệ!");

        setIsSubmitting(true);
        try {
            const payload = {
                customer_id: selectedCustomer.customer_id,
                status: status,
                items: validItems
            };

            const res = await fetch("http://localhost:5001/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (data.success) {
                alert("Tạo đơn hàng thành công!");
                router.push("/order");
            } else {
                alert("Lỗi: " + data.message);
            }
        } catch (error) {
            alert("Lỗi kết nối đến server!");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6 bg-gray-50 min-h-screen font-sans">

            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => router.back()} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition">
                    <ArrowLeft size={20} className="text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Create New Order</h1>
                    <p className="text-sm text-gray-500">Fill in the details below to generate a new order.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* PHẦN 1: THÔNG TIN CHUNG (Master) */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
                    <h2 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">General Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Customer <span className="text-red-500">*</span></label>

                            <div className="flex items-center gap-2">
                                {/* Input chỉ đọc hiển thị tên người được chọn */}
                                <div className="relative flex-1">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        readOnly
                                        placeholder="Nguyen Van A (Ho Chi Minh City)"
                                        value={selectedCustomer ? `${selectedCustomer.customer_name} (${selectedCustomer.city})` : ""}
                                        required // Vẫn required để form chặn submit
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 text-gray-700 cursor-default"
                                    />
                                </div>

                                {/* Nút bấm để mở Modal tìm kiếm */}
                                <button
                                    type="button"
                                    onClick={() => setIsCustomerModalOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm whitespace-nowrap shadow-sm"
                                >
                                    <Search size={16} /> Search & Select
                                </button>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Initial Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            >
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* PHẦN 2: DANH SÁCH SẢN PHẨM (Detail) */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between border-b pb-2 mb-4">
                        <h2 className="text-lg font-bold text-gray-800">Order Items</h2>
                        <button
                            type="button"
                            onClick={handleAddItem}
                            className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 transition bg-blue-50 px-3 py-1.5 rounded-lg"
                        >
                            <Plus size={16} /> Add Item
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* Header của bảng danh sách */}
                        <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-500 px-2">
                            <div className="col-span-6">Product</div>
                            <div className="col-span-3">Quantity</div>
                            <div className="col-span-2 text-right">Subtotal</div>
                            <div className="col-span-1 text-center">Action</div>
                        </div>

                        {/* Các dòng sản phẩm */}
                        {items.map((item, index) => {
                            const selectedProduct = products.find(p => p.product_id === item.product_id);
                            const subtotal = selectedProduct ? selectedProduct.price * item.order_qty : 0;

                            return (
                                <div key={index} className="grid grid-cols-12 gap-4 items-center bg-gray-50 p-2 rounded-lg border border-gray-100">
                                    {/* Chọn Sản phẩm */}
                                    <div className="col-span-6">
                                        <select
                                            value={item.product_id}
                                            onChange={(e) => handleItemChange(index, "product_id", e.target.value)}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                                        >
                                            <option value="">-- Select Product --</option>
                                            {products.map((p) => (
                                                <option key={p.product_id} value={p.product_id}>
                                                    {p.product_name} - ${p.price}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Nhập số lượng */}
                                    <div className="col-span-3">
                                        <input
                                            type="number"
                                            min="1"
                                            value={item.order_qty}
                                            onChange={(e) => handleItemChange(index, "order_qty", parseInt(e.target.value) || 1)}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                                        />
                                    </div>

                                    {/* Tạm tính 1 dòng */}
                                    <div className="col-span-2 text-right font-medium text-gray-700">
                                        ${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>

                                    {/* Nút xóa dòng */}
                                    <div className="col-span-1 flex justify-center">
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveItem(index)}
                                            disabled={items.length === 1} // Không cho xóa nếu chỉ còn 1 dòng
                                            className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition disabled:opacity-30 disabled:hover:bg-transparent"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Tổng cộng */}
                    <div className="mt-6 pt-4 border-t flex justify-between items-center bg-green-50/50 p-4 rounded-lg">
                        <span className="text-gray-600 font-semibold text-lg">Estimated Total:</span>
                        <span className="text-2xl font-bold text-emerald-600">
                            ${calculateTotal().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>

                {/* Nút Submit */}
                <div className="flex justify-end gap-4 pt-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition flex items-center gap-2 shadow-sm disabled:opacity-70"
                    >
                        <Save size={18} />
                        {isSubmitting ? "Processing..." : "Submit Order"}
                    </button>
                </div>
            </form>
            <CustomerSelectModal
                isOpen={isCustomerModalOpen}
                onClose={() => setIsCustomerModalOpen(false)}
                onSelect={(customer) => setSelectedCustomer(customer)} // Nhận object và lưu vào state
            />
        </div>
    );
}