import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import type { OrderStatus } from "@prisma/client";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const order = await db.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: { select: { name: true, images: true, slug: true } },
            package: { select: { name: true, images: true, slug: true } },
          },
        },
        statusLogs: { orderBy: { createdAt: "asc" } },
        payment: true,
        user: { select: { name: true, email: true } },
      },
    });

    if (!order) return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });

    const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(session.user.role);
    if (!isAdmin && order.userId !== session.user.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: order });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch order" }, { status: 500 });
  }
}

const updateSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]).optional(),
  note: z.string().optional(),
  paymentStatus: z.enum(["UNPAID", "PENDING", "PAID", "FAILED", "REFUNDED", "PARTIALLY_REFUNDED"]).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status, note, paymentStatus } = updateSchema.parse(body);

    const order = await db.$transaction(async (tx: Parameters<Parameters<typeof db.$transaction>[0]>[0]) => {
      const updated = await tx.order.update({
        where: { id },
        data: {
          ...(status && { status }),
          ...(paymentStatus && { paymentStatus }),
        },
      });

      if (status) {
        await tx.orderStatusLog.create({ data: { orderId: id, status: status as OrderStatus, note } });
      }

      return updated;
    });

    return NextResponse.json({ success: true, data: order });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Failed to update order" }, { status: 500 });
  }
}
