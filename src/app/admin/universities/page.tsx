"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Search, MoreHorizontal, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { staggerContainer, staggerItem } from "@/lib/motion";

const universities = [
  { id: "1", name: "Cairo University", nameAr: "جامعة القاهرة", slug: "cairo-university", location: "Cairo", packages: 12, students: 234, isActive: true },
  { id: "2", name: "Ain Shams University", nameAr: "جامعة عين شمس", slug: "ain-shams-university", location: "Cairo", packages: 10, students: 189, isActive: true },
  { id: "3", name: "Alexandria University", nameAr: "جامعة الإسكندرية", slug: "alexandria-university", location: "Alexandria", packages: 8, students: 156, isActive: true },
  { id: "4", name: "Future University in Egypt", nameAr: null, slug: "future-university-egypt", location: "New Cairo", packages: 9, students: 98, isActive: true },
  { id: "5", name: "Misr International University", nameAr: null, slug: "misr-international-university", location: "6th of October", packages: 7, students: 72, isActive: true },
  { id: "6", name: "October 6 University", nameAr: "جامعة 6 أكتوبر", slug: "october-6-university", location: "6th of October", packages: 6, students: 54, isActive: true },
  { id: "7", name: "British University in Egypt", nameAr: null, slug: "british-university-egypt", location: "New Cairo", packages: 8, students: 67, isActive: true },
  { id: "8", name: "Badr University", nameAr: "جامعة بدر", slug: "badr-university", location: "Badr City", packages: 5, students: 43, isActive: false },
];

export default function AdminUniversitiesPage() {
  const [search, setSearch] = useState("");

  const filtered = universities.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="font-display text-2xl font-bold text-[#0A2540]">Universities</h1>
          <p className="text-sm text-[#6B7A8D] mt-1">{universities.length} universities configured</p>
        </div>
        <Button className="bg-[#0A2540] hover:bg-[#0D3461] text-white rounded-xl flex items-center gap-2 cursor-pointer">
          <Plus size={15} /> Add University
        </Button>
      </motion.div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9BAAB8]" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search universities..."
          className="pl-10 bg-white border-[#E2E8F0] rounded-xl"
        />
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-semibold text-[#9BAAB8] uppercase tracking-wide border-b border-[#F4F6F8]">
                <th className="px-5 py-3.5">University</th>
                <th className="px-5 py-3.5">Location</th>
                <th className="px-5 py-3.5">Packages</th>
                <th className="px-5 py-3.5">Students</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F6F8]">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-[#FAFAF8] transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#0A2540] text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {u.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#0A2540]">{u.name}</p>
                        {u.nameAr && <p className="text-xs text-[#9BAAB8]" dir="rtl">{u.nameAr}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-[#6B7A8D]">{u.location}</td>
                  <td className="px-5 py-4">
                    <span className="text-sm font-semibold text-[#0A2540]">{u.packages}</span>
                    <span className="text-xs text-[#9BAAB8] ml-1">packages</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm font-semibold text-[#0A2540]">{u.students}</span>
                    <span className="text-xs text-[#9BAAB8] ml-1">enrolled</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${u.isActive ? "bg-green-50 text-green-700 border-green-100" : "bg-gray-50 text-gray-500 border-gray-100"}`}>
                      {u.isActive ? "Active" : "Inactive"}
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
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
