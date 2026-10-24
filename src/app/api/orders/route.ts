import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { generateOrderNumber } from "@/lib/utils";

const orderItemSchema = z.object({
  productId: z.string().optional(),
  packageId: z.string().optional(),
  name: z.string(),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
});

const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1),
  couponCode: z.string().optional(),
  shippingName: z.string().min(2),
  shippingPhone: z.string().min(10),
  shippingAddress: z.string().min(5),
  shippingCity: z.string().min(2),
  shippingGov: z.string().min(2),
  notes: z.string().optional(),
  paymentMethod: z.enum(["instapay", "card", "cod"]),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, error: "Please sign in to place an order" }, { status: 401 });
    }

    const body = await req.json();
    const data = createOrderSchema.parse(body);

    // Validate stock and resolve prices from DB
    const validatedItems = await Promise.all(
      data.items.map(async (item) => {
        if (item.packageId) {
          const pkg = await db.package.findUnique({ where: { id: item.packageId }, select: { price: true, stock: true, name: true } });
          if (!pkg) throw new Error(`Package not found: ${item.packageId}`);
          if (pkg.stock < item.quantity) throw new Error(`Insufficient stock for: ${pkg.name}`);
          return { ...item, price: Number(pkg.price), name: pkg.name };
        }
        if (item.productId) {
          const prod = await db.product.findUnique({ where: { id: item.productId }, select: { price: true, stock: true, name: true } });
          if (!prod) throw new Error(`Product not found: ${item.productId}`);
          if (prod.stock < item.quantity) throw new Error(`Insufficient stock for: ${prod.name}`);
          return { ...item, price: Number(prod.price), name: prod.name };
        }
        return item;
      })
    );

    const subtotal = validatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Validate coupon
    let discount = 0;
    if (data.couponCode) {
      const coupon = await db.coupon.findUnique({ where: { code: data.couponCode.toUpperCase() } });
      if (coupon && coupon.isActive && (!coupon.expiresAt || coupon.expiresAt > new Date())) {
        if (!coupon.usageLimit || coupon.usageCount < coupon.usageLimit) {
          if (!coupon.minOrder || subtotal >= Number(coupon.minOrder)) {
            if (coupon.type === "PERCENTAGE") {
              discount = Math.round(subtotal * (Number(coupon.value) / 100));
              if (coupon.maxDiscount) discount = Math.min(discount, Number(coupon.maxDiscount));
            } else {
              discount = Number(coupon.value);
            }
          }
        }
      }
    }

    const shippingSetting = await db.siteSettings.findUnique({ where: { key: "free_shipping_threshold" } });
    const threshold = Number(shippingSetting?.value || 500);
    const shippingCostSetting = await db.siteSettings.findUnique({ where: { key: "default_shipping_cost" } });
    const shippingCost = Number(shippingCostSetting?.value || 80);
    const shipping = subtotal >= threshold ? 0 : shippingCost;
    const total = subtotal - discount + shipping;

    const order = await db.$transaction(async (tx: Parameters<Parameters<typeof db.$transaction>[0]>[0]) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId: session.user.id,
          subtotal,
          discount,
          shipping,
          total,
          couponCode: data.couponCode || null,
          notes: data.notes,
          shippingName: data.shippingName,
          shippingPhone: data.shippingPhone,
          shippingAddress: data.shippingAddress,
          shippingCity: data.shippingCity,
          shippingGov: data.shippingGov,
          paymentMethod: data.paymentMethod,
          items: {
            create: validatedItems.map((item) => ({
              productId: item.productId,
              packageId: item.packageId,
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              total: item.price * item.quantity,
            })),
          },
          statusLogs: { create: { status: "PENDING", note: "Order placed" } },
        },
        include: { items: true },
      });

      // Decrement stock
      for (const item of validatedItems) {
        if (item.packageId) {
          await tx.package.update({ where: { id: item.packageId }, data: { stock: { decrement: item.quantity } } });
        }
        if (item.productId) {
          await tx.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } });
        }
      }

      // Increment coupon usage
      if (data.couponCode && discount > 0) {
        await tx.coupon.update({ where: { code: data.couponCode.toUpperCase() }, data: { usageCount: { increment: 1 } } });
      }

      // Clear cart
      await tx.cartItem.deleteMany({ where: { userId: session.user.id } });

      return newOrder;
    });

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.issues[0].message }, { status: 400 });
    }
    if (err instanceof Error) {
      return NextResponse.json({ success: false, error: err.message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Failed to create order" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const page = parseInt(searchParams.get("page") || "1");

    // Admins can see all orders
    const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(session.user.role);
    const where = isAdmin ? {} : { userId: session.user.id };

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        include: {
          items: true,
          user: { select: { name: true, email: true } },
          payment: { select: { status: true, paidAt: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.order.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: orders,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch orders" }, { status: 500 });
  }
}
