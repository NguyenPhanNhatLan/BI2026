import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AddCustomerModal({ onClose, onRefresh }: any) {
  const [customer_name, setCustomerName] = useState("");
  const [city, setCity] = useState("");
  

  const [infull, setInfull] = useState<number | string>(100);
  const [ontime, setOntime] = useState<number | string>(100);
  const [otif, setOtif] = useState<number | string>(100);

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"success" | "error" | null>(null);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      setLoading(true);
      setStatus(null);

      const payload = {
        customer_name,
        city,
        target: {
          infull: Number(infull),
          ontime: Number(ontime),
          otif: Number(otif),
        },
      };

      const res = await fetch("http://localhost:5001/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to create customer");
      }

      setStatus("success");
      setMessage("Khách hàng và chỉ số mục tiêu đã được tạo!");

      onRefresh();

      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error: any) {
      setStatus("error");
      setMessage(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Add New Customer
        </h2>

        {status && (
          <Alert
            className={`mb-4 ${
              status === "error" ? "border-red-500 text-red-700 bg-red-50" : "border-green-500 text-green-700 bg-green-50"
            }`}
          >
            <AlertTitle>
              {status === "success" ? "Success" : "Error"}
            </AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nhóm Thông tin cơ bản */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Customer Name
            </label>
            <input
              value={customer_name}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">City</label>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          {/* Nhóm Chỉ số mục tiêu (Target Metrics) - Dùng Grid chia 3 cột */}
          <div className="pt-2">
            <h3 className="text-sm font-medium text-gray-800 mb-2 border-b pb-1">Target Metrics (%)</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">In-Full</label>
                <input
                  type="float"
                  min="0"
                  max="1"
                  value={infull}
                  onChange={(e) => setInfull(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">On-Time</label>
                <input
                  type="float"
                  min="0"
                  max="1"
                  value={ontime}
                  onChange={(e) => setOntime(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">OTIF</label>
                <input
                  type="float"
                  min="0"
                  max="1"
                  value={otif}
                  onChange={(e) => setOtif(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                  required
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-4 mt-2 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white shadow-sm disabled:opacity-50 transition-colors"
            >
              {loading ? "Adding..." : "Add Customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}