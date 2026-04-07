"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="flex items-center justify-between bg-blue-600 text-white p-4">
      <h1 className="font-bold text-lg">Operation App</h1>

      <div className="flex items-center space-x-6 relative">

        <Link href="/dashboard" className="hover:underline">
          Dashboard
        </Link>

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