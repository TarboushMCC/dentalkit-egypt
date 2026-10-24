import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const wishlist = await db.wishlistItem.findMany({
      where: { userId: session.user.id },
      include: {
        product: { select: { id: true, name: true, slug: true, price: true, comparePrice: true, images: true } },
        package: { select: { id: true, name: true, slug: true, price: true, comparePrice: true, images: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: wishlist });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch wishlist" }, { status: 500 });
  }
}

const toggleSchema = z.object({
  productId: z.string().optional(),
  packageId: z.string().optional(),
}).refine((d) => d.productId || d.packageId, { message: "Either productId or packageId is required" });

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const data = toggleSchema.parse(body);

    const existing = await db.wishlistItem.findFirst({
      where: { userId: session.user.id, productId: data.productId || null, packageId: data.packageId || null },
    });

    if (existing) {
      await db.wishlistItem.delete({ where: { id: existing.id } });
      return NextResponse.json({ success: true, action: "removed" });
    }

    const item = await db.wishlistItem.create({
      data: { userId: session.user.id, productId: data.productId, packageId: data.packageId },
    });

    return NextResponse.json({ success: true, action: "added", data: item }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Failed to update wishlist" }, { status: 500 });
  }
}
