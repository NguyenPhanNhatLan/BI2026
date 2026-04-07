import DashboardCharts from "@/components/dashboard/DashboardCharts";
import DashboardSummary from "@/components/dashboard/DashboardSummary";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tổng quan Kinh doanh</h1>
          <p className="text-gray-500 mt-2">Dữ liệu được cập nhật theo thời gian thực.</p>
        </div>


        <DashboardSummary />


        <DashboardCharts />
      </div>
    </main>
  );
}