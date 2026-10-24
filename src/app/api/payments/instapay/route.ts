import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";

const initiateSchema = z.object({
  orderId: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { orderId } = initiateSchema.parse(body);

    // Fetch order and verify ownership
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { user: { select: { name: true, email: true } } },
    });

    if (!order) return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    if (order.userId !== session.user.id) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    if (order.paymentStatus === "PAID") return NextResponse.json({ success: false, error: "Order is already paid" }, { status: 400 });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3006";

    // Instapay API call — replace with actual SDK when credentials are available
    const instapayPayload = {
      merchant_id: process.env.INSTAPAY_MERCHANT_ID,
      api_key: process.env.INSTAPAY_API_KEY,
      amount: Number(order.total) * 100, // Convert to piastres
      currency: "EGP",
      order_id: order.orderNumber,
      customer_name: order.shippingName || order.user.name,
      customer_email: order.user.email,
      customer_phone: order.shippingPhone,
      description: `DentalKit Egypt - Order ${order.orderNumber}`,
      return_url: `${appUrl}/checkout/confirm?orderId=${order.id}`,
      cancel_url: `${appUrl}/checkout/cancel?orderId=${order.id}`,
      webhook_url: `${appUrl}/api/payments/instapay/webhook`,
      metadata: { orderId: order.id, orderNumber: order.orderNumber },
    };

    // TODO: Replace with real Instapay SDK call:
    // const instapay = new InstapayClient({ apiKey: process.env.INSTAPAY_API_KEY! });
    // const session = await instapay.createSession(instapayPayload);

    // For now, create a deterministic mock session for development
    const mockSessionId = `ip_${order.orderNumber}_${Date.now()}`;
    const mockPaymentUrl = `${appUrl}/checkout/mock-payment?sessionId=${mockSessionId}&orderId=${order.id}&amount=${order.total}`;

    // Record payment initiation in DB
    await db.payment.upsert({
      where: { orderId: order.id },
      update: {
        providerRef: mockSessionId,
        providerData: instapayPayload as object,
        status: "PENDING",
      },
      create: {
        orderId: order.id,
        provider: "instapay",
        amount: order.total,
        currency: "EGP",
        status: "PENDING",
        providerRef: mockSessionId,
        providerData: instapayPayload as object,
      },
    });

    // Update order payment status
    await db.order.update({ where: { id: order.id }, data: { paymentStatus: "PENDING", paymentRef: mockSessionId } });

    return NextResponse.json({
      success: true,
      data: {
        sessionId: mockSessionId,
        paymentUrl: mockPaymentUrl,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        amount: order.total,
        currency: "EGP",
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.issues[0].message }, { status: 400 });
    }
    console.error("Payment initiation error:", err);
    return NextResponse.json({ success: false, error: "Payment initiation failed" }, { status: 500 });
  }
}
