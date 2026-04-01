"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="flex items-center justify-between bg-blue-600 text-white p-4">
      <h1 className="font-bold text-lg">Operation App</h1>

      <div className="flex items-center space-x-6 relative">

        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="hover:underline"
          >
            Dashboard ▼
          </button>

          {open && (
            <div className="absolute bg-white text-black mt-2 rounded shadow-md">

              <Link
                href="/dashboard/order"
                className="block px-4 py-2 hover:bg-gray-200"
              >
                Order
              </Link>
            </div>
          )}
        </div>

        <Link href="/customer" className="hover:underline">
          Customer
        </Link>

        <Link href="/product" className="hover:underline">
          Product
        </Link>

        <Link href="/order" className="hover:underline">
          Order
        </Link>

      </div>
    </nav>
  );
}