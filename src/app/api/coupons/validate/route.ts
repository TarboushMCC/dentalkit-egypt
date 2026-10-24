import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { code, orderTotal } = z.object({ code: z.string(), orderTotal: z.number().positive() }).parse(body);

    const coupon = await db.coupon.findUnique({ where: { code: code.toUpperCase() } });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ success: false, error: "Invalid coupon code" }, { status: 400 });
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return NextResponse.json({ success: false, error: "This coupon has expired" }, { status: 400 });
    }

    if (coupon.startsAt && coupon.startsAt > new Date()) {
      return NextResponse.json({ success: false, error: "This coupon is not yet active" }, { status: 400 });
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json({ success: false, error: "This coupon has reached its usage limit" }, { status: 400 });
    }

    if (coupon.minOrder && orderTotal < Number(coupon.minOrder)) {
      return NextResponse.json({
        success: false,
        error: `Minimum order of EGP ${coupon.minOrder} required`,
      }, { status: 400 });
    }

    let discountAmount = 0;
    if (coupon.type === "PERCENTAGE") {
      discountAmount = Math.round(orderTotal * (Number(coupon.value) / 100));
      if (coupon.maxDiscount) discountAmount = Math.min(discountAmount, Number(coupon.maxDiscount));
    } else {
      discountAmount = Math.min(Number(coupon.value), orderTotal);
    }

    return NextResponse.json({
      success: true,
      data: {
        code: coupon.code,
        type: coupon.type,
        value: Number(coupon.value),
        discountAmount,
        finalTotal: orderTotal - discountAmount,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Failed to validate coupon" }, { status: 500 });
  }
}
