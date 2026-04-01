"use client";

import AddCustomerModal from "@/components/customers/CustomerModal";
import CustomerTable from "@/components/customers/CustomerTable";
import { useState } from "react";

export default function CustomerPage() {
  const [filter, setFilter] = useState({
    city: "",
  });

  const [showModal, setShowModal] = useState(false);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchCustomers = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="w-full max-w-5xl mx-auto mt-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Customer Management
        </h1>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-sm transition-colors font-medium"
        >
          <span className="text-xl leading-none">+</span>
          Add Customer
        </button>
      </div>
      <CustomerTable
        filter={filter}
        refreshTrigger={refreshTrigger}
        onRefresh={fetchCustomers}
      />

      {showModal && (
        <AddCustomerModal
          onClose={() => setShowModal(false)}
          onRefresh={fetchCustomers}
        />
      )}
    </div>
  );
}