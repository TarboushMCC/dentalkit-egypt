import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const cart = await db.cartItem.findMany({
      where: { userId: session.user.id },
      include: {
        product: { select: { id: true, name: true, slug: true, price: true, comparePrice: true, images: true, stock: true } },
        package: { select: { id: true, name: true, slug: true, price: true, comparePrice: true, images: true, stock: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    const total = (cart as typeof cart).reduce((sum: number, item: typeof cart[0]) => {
      const price = item.package ? Number(item.package.price) : Number(item.product?.price || 0);
      return sum + price * item.quantity;
    }, 0);

    return NextResponse.json({ success: true, data: { items: cart, total, count: cart.length } });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch cart" }, { status: 500 });
  }
}

const addSchema = z.object({
  productId: z.string().optional(),
  packageId: z.string().optional(),
  quantity: z.number().int().positive().default(1),
}).refine((d) => d.productId || d.packageId, { message: "Either productId or packageId is required" });

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const data = addSchema.parse(body);

    const existing = await db.cartItem.findFirst({
      where: {
        userId: session.user.id,
        productId: data.productId || null,
        packageId: data.packageId || null,
      },
    });

    let cartItem;
    if (existing) {
      const maxQty = 10;
      cartItem = await db.cartItem.update({
        where: { id: existing.id },
        data: { quantity: Math.min(existing.quantity + data.quantity, maxQty) },
      });
    } else {
      cartItem = await db.cartItem.create({
        data: { userId: session.user.id, productId: data.productId, packageId: data.packageId, quantity: data.quantity },
      });
    }

    return NextResponse.json({ success: true, data: cartItem }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Failed to update cart" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");
    const clearAll = searchParams.get("clear") === "true";

    if (clearAll) {
      await db.cartItem.deleteMany({ where: { userId: session.user.id } });
    } else if (itemId) {
      await db.cartItem.deleteMany({ where: { id: itemId, userId: session.user.id } });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to remove cart item" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { itemId, quantity } = z.object({ itemId: z.string(), quantity: z.number().int().min(1).max(10) }).parse(body);

    const item = await db.cartItem.findUnique({ where: { id: itemId } });
    if (!item || item.userId !== session.user.id) {
      return NextResponse.json({ success: false, error: "Cart item not found" }, { status: 404 });
    }

    const updated = await db.cartItem.update({ where: { id: itemId }, data: { quantity } });
    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Failed to update quantity" }, { status: 500 });
  }
}
