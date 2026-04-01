"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, AlertOctagon, X, Clock, Navigation } from "lucide-react";
import { socket } from "@/lib/socket";

interface StreamAlert {
  id: string; 
  level: "CRITICAL" | "WARNING";
  type: string;
  order_id: string;
  message: string;
  note: string;
  timestamp: string;
}

export default function LiveAlertFeed() {
  const [alerts, setAlerts] = useState<StreamAlert[]>([]);

  useEffect(() => {
    if (!socket.connected) socket.connect();

    const handleNewAlert = (data: Omit<StreamAlert, "id">) => {
      const newAlert = { ...data, id: Math.random().toString(36).substring(7) };
      
      setAlerts((prev) => [newAlert, ...prev].slice(0, 50));
    };

    socket.on("OPERATIONAL_ALERT", handleNewAlert);

    return () => {
      socket.off("OPERATIONAL_ALERT", handleNewAlert);
    };
  }, []);

  const removeAlert = (id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-112.5">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-t-xl">
        <div className="flex items-center gap-2">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </div>
          <h2 className="text-base font-bold text-gray-800">Live Operation Alerts</h2>
        </div>
        <span className="text-xs font-medium bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
          {alerts.length} active
        </span>
      </div>

      {/* Feed Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
        {alerts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
            <Navigation size={32} className="opacity-50" />
            <p className="text-sm font-medium">Hệ thống vận hành đang ổn định</p>
            <p className="text-xs">Đang lắng nghe luồng dữ liệu Kafka...</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`relative p-4 rounded-lg border-l-4 shadow-sm transition-all animate-in slide-in-from-left-4 fade-in duration-300 ${
                alert.level === "CRITICAL"
                  ? "bg-red-50 border-red-500"
                  : "bg-amber-50 border-amber-500"
              }`}
            >
              <button
                onClick={() => removeAlert(alert.id)}
                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-700 transition"
                title="Acknowledge (Đã ghi nhận)"
              >
                <X size={16} />
              </button>

              <div className="flex gap-3">
                <div className="mt-0.5">
                  {alert.level === "CRITICAL" ? (
                    <AlertOctagon size={20} className="text-red-500" />
                  ) : (
                    <AlertTriangle size={20} className="text-amber-500" />
                  )}
                </div>
                <div className="flex-1 pr-6">
                  <h3
                    className={`text-sm font-bold ${
                      alert.level === "CRITICAL" ? "text-red-800" : "text-amber-800"
                    }`}
                  >
                    {alert.level === "CRITICAL" ? "Rò rỉ doanh thu / Lỗi In-Full" : "Cảnh báo trễ SLA"}
                  </h3>
                  <p className="text-sm text-gray-700 mt-1 font-medium">{alert.message}</p>
                  
                  {/* Hiển thị raw Note từ tài xế (Streaming Analysis) */}
                  {alert.note && (
                    <div className="mt-2 p-2 bg-white/60 rounded border border-gray-200 text-xs text-gray-600 italic">
                      Lý do hiện trường: "{alert.note}"
                    </div>
                  )}

                  <div className="flex items-center gap-3 mt-3 text-xs text-gray-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(alert.timestamp).toLocaleTimeString('vi-VN')}
                    </span>
                    <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-gray-200">
                      #{alert.order_id.substring(0, 8)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}