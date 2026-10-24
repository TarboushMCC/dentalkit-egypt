"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Eye, Truck, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";

const orders = [
  { id: "DK-AAA001", student: "Nour Ahmed", email: "nour@cairo.edu.eg", package: "Second Year Clinical Kit", university: "Cairo University", amount: 2850, status: "DELIVERED", payment: "PAID", date: "Jun 1, 2025" },
  { id: "DK-AAA002", student: "Omar Hassan", email: "omar@ainshams.edu.eg", package: "First Year Starter Kit", university: "Ain Shams University", amount: 1850, status: "SHIPPED", payment: "PAID", date: "Jun 1, 2025" },
  { id: "DK-AAA003", student: "Sara Mahmoud", email: "sara@alex.edu.eg", package: "Third Year Operative Kit", university: "Alexandria University", amount: 3200, status: "PROCESSING", payment: "PAID", date: "May 31, 2025" },
  { id: "DK-AAA004", student: "Ahmed Karim", email: "ahmed@fue.edu.eg", package: "Year 2 Clinical Essentials", university: "Future University", amount: 2650, status: "PENDING", payment: "UNPAID", date: "May 31, 2025" },
  { id: "DK-AAA005", student: "Layla Ibrahim", email: "layla@miu.edu.eg", package: "First Year Basic Kit", university: "Misr International", amount: 1650, status: "CANCELLED", payment: "REFUNDED", date: "May 30, 2025" },
  { id: "DK-AAA006", student: "Youssef Tarek", email: "youssef@o6u.edu.eg", package: "Year 1 Foundation Kit", university: "October 6 University", amount: 1700, status: "CONFIRMED", payment: "PAID", date: "May 30, 2025" },
];

const statusStyle: Record<string, string> = {
  DELIVERED: "bg-green-50 text-green-700 border-green-100",
  SHIPPED: "bg-blue-50 text-blue-700 border-blue-100",
  PROCESSING: "bg-amber-50 text-amber-700 border-amber-100",
  CONFIRMED: "bg-purple-50 text-purple-700 border-purple-100",
  PENDING: "bg-gray-50 text-gray-600 border-gray-100",
  CANCELLED: "bg-red-50 text-red-600 border-red-100",
};

const paymentStyle: Record<string, string> = {
  PAID: "bg-green-50 text-green-700",
  UNPAID: "bg-amber-50 text-amber-700",
  REFUNDED: "bg-gray-50 text-gray-600",
};

const statuses = ["All", "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function AdminOrdersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = orders.filter((o) => {
    const matchSearch = o.id.toLowerCase().includes(search.toLowerCase()) || o.student.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="font-display text-2xl font-bold text-[#0A2540]">Orders</h1>
        <p className="text-sm text-[#6B7A8D] mt-1">{orders.length} total orders</p>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9BAAB8]" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by order ID or student..." className="pl-10 bg-white border-[#E2E8F0] rounded-xl" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${statusFilter === s ? "bg-[#0A2540] text-white" : "bg-white border border-[#E2E8F0] text-[#6B7A8D] hover:border-[#0A2540]/30"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
        <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-semibold text-[#9BAAB8] uppercase tracking-wide border-b border-[#F4F6F8]">
                <th className="px-5 py-3.5">Order</th>
                <th className="px-5 py-3.5">Student</th>
                <th className="px-5 py-3.5">Package</th>
                <th className="px-5 py-3.5">Amount</th>
                <th className="px-5 py-3.5">Payment</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F6F8]">
              {filtered.map((o) => (
                <tr key={o.id} className="hover:bg-[#FAFAF8] transition-colors">
                  <td className="px-5 py-3.5">
                    <span className="text-xs font-mono font-semibold text-[#0A2540]">{o.id}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-medium text-[#0A2540]">{o.student}</p>
                    <p className="text-xs text-[#9BAAB8]">{o.university}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-xs text-[#6B7A8D] max-w-[160px] truncate">{o.package}</p>
                  </td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-[#0A2540]">{formatPrice(o.amount)}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${paymentStyle[o.payment]}`}>{o.payment}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusStyle[o.status]}`}>{o.status}</span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-[#9BAAB8]">{o.date}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg text-[#9BAAB8] hover:bg-[#F4F6F8] hover:text-[#0A2540] transition-colors cursor-pointer" aria-label="View order">
                        <Eye size={13} />
                      </button>
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg text-[#9BAAB8] hover:bg-blue-50 hover:text-blue-500 transition-colors cursor-pointer" aria-label="Mark shipped">
                        <Truck size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
