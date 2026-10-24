"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Search, Tag, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";

const packages = [
  { id: "1", name: "First Year Starter Kit", university: "Cairo University", year: "Year 1", price: 1850, comparePrice: 2600, stock: 45, isActive: true, isRequired: true },
  { id: "2", name: "Second Year Clinical Kit", university: "Cairo University", year: "Year 2", price: 2850, comparePrice: 4200, stock: 23, isActive: true, isRequired: true },
  { id: "3", name: "Third Year Operative Kit", university: "Cairo University", year: "Year 3", price: 3200, comparePrice: 4800, stock: 18, isActive: true, isRequired: true },
  { id: "4", name: "Year 1 Foundation Kit", university: "Ain Shams University", year: "Year 1", price: 1700, comparePrice: 2400, stock: 31, isActive: true, isRequired: true },
  { id: "5", name: "Year 2 Clinical Essentials", university: "Ain Shams University", year: "Year 2", price: 2650, comparePrice: 3900, stock: 14, isActive: true, isRequired: true },
  { id: "6", name: "First Year Basic Kit", university: "Alexandria University", year: "Year 1", price: 1650, comparePrice: 2300, stock: 27, isActive: true, isRequired: true },
];

export default function AdminPackagesPage() {
  const [search, setSearch] = useState("");

  const filtered = packages.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.university.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#0A2540]">Packages</h1>
          <p className="text-sm text-[#6B7A8D] mt-1">{packages.length} packages across all universities</p>
        </div>
        <Button className="bg-[#0A2540] hover:bg-[#0D3461] text-white rounded-xl flex items-center gap-2 cursor-pointer">
          <Plus size={15} /> Create Package
        </Button>
      </motion.div>

      <div className="relative">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9BAAB8]" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search packages..." className="pl-10 bg-white border-[#E2E8F0] rounded-xl" />
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
        <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-semibold text-[#9BAAB8] uppercase tracking-wide border-b border-[#F4F6F8]">
                <th className="px-5 py-3.5">Package</th>
                <th className="px-5 py-3.5">Price</th>
                <th className="px-5 py-3.5">Savings</th>
                <th className="px-5 py-3.5">Stock</th>
                <th className="px-5 py-3.5">Type</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F6F8]">
              {filtered.map((p) => {
                const savings = p.comparePrice - p.price;
                const percent = Math.round((savings / p.comparePrice) * 100);
                return (
                  <tr key={p.id} className="hover:bg-[#FAFAF8] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#F4F6F8] flex items-center justify-center">
                          <Package size={15} className="text-[#6B7A8D]" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#0A2540]">{p.name}</p>
                          <p className="text-xs text-[#9BAAB8]">{p.university} • {p.year}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-[#0A2540]">{formatPrice(p.price)}</p>
                      <p className="text-xs text-[#9BAAB8] line-through">{formatPrice(p.comparePrice)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-1 text-xs text-green-700 font-semibold bg-green-50 px-2 py-0.5 rounded-full w-fit">
                        <Tag size={9} /> {percent}% off
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-sm font-semibold ${p.stock < 20 ? "text-amber-600" : "text-[#0A2540]"}`}>{p.stock}</span>
                      {p.stock < 20 && <span className="text-xs text-amber-500 ml-1">low</span>}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${p.isRequired ? "bg-[#0A2540]/10 text-[#0A2540] border-[#0A2540]/20" : "bg-blue-50 text-blue-600 border-blue-100"}`}>
                        {p.isRequired ? "Required" : "Optional"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${p.isActive ? "bg-green-50 text-green-700 border-green-100" : "bg-gray-50 text-gray-500 border-gray-100"}`}>
                        {p.isActive ? "Active" : "Draft"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button className="w-7 h-7 flex items-center justify-center rounded-lg text-[#9BAAB8] hover:bg-[#F4F6F8] hover:text-[#0A2540] transition-colors cursor-pointer">
                          <Pencil size={13} />
                        </button>
                        <button className="w-7 h-7 flex items-center justify-center rounded-lg text-[#9BAAB8] hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
