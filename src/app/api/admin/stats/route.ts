import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalOrders, monthOrders, lastMonthOrders,
      totalUsers, monthUsers,
      totalRevenue, monthRevenue, lastMonthRevenue,
      pendingOrders, recentOrders,
      topUniversities,
    ] = await Promise.all([
      db.order.count(),
      db.order.count({ where: { createdAt: { gte: startOfMonth } } }),
      db.order.count({ where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
      db.user.count({ where: { role: "STUDENT" } }),
      db.user.count({ where: { role: "STUDENT", createdAt: { gte: startOfMonth } } }),
      db.order.aggregate({ where: { paymentStatus: "PAID" }, _sum: { total: true } }),
      db.order.aggregate({ where: { paymentStatus: "PAID", createdAt: { gte: startOfMonth } }, _sum: { total: true } }),
      db.order.aggregate({ where: { paymentStatus: "PAID", createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } }, _sum: { total: true } }),
      db.order.count({ where: { status: "PENDING" } }),
      db.order.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true } }, items: { take: 1 } },
      }),
      db.university.findMany({
        where: { isActive: true },
        include: {
          _count: { select: { packages: true, studentProfiles: true } },
        },
        orderBy: { sortOrder: "asc" },
        take: 5,
      }),
    ]);

    const totalRev = Number(totalRevenue._sum.total || 0);
    const monthRev = Number(monthRevenue._sum.total || 0);
    const lastMonthRev = Number(lastMonthRevenue._sum.total || 0);

    const revenueChange = lastMonthRev > 0 ? ((monthRev - lastMonthRev) / lastMonthRev) * 100 : 0;
    const ordersChange = lastMonthOrders > 0 ? ((monthOrders - lastMonthOrders) / lastMonthOrders) * 100 : 0;

    return NextResponse.json({
      success: true,
      data: {
        kpis: {
          totalRevenue: totalRev,
          monthRevenue: monthRev,
          revenueChange: Math.round(revenueChange * 10) / 10,
          totalOrders,
          monthOrders,
          ordersChange: Math.round(ordersChange * 10) / 10,
          totalStudents: totalUsers,
          monthStudents: monthUsers,
          pendingOrders,
        },
        recentOrders,
        topUniversities,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Failed to fetch stats" }, { status: 500 });
  }
}
