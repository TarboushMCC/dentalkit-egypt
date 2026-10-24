import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";

function verifySignature(body: string, signature: string, secret: string): boolean {
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(`sha256=${expected}`), Buffer.from(signature));
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-instapay-signature") || "";
  const webhookSecret = process.env.INSTAPAY_WEBHOOK_SECRET || "";

  // Skip signature check in development if no secret is set
  if (webhookSecret && !verifySignature(body, signature, webhookSecret)) {
    console.warn("Instapay webhook: invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    const event = JSON.parse(body);
    const { type, data } = event as { type: string; data: Record<string, unknown> };

    console.log(`Instapay webhook received: ${type}`);

    switch (type) {
      case "payment.completed":
      case "payment.success":
        await handlePaymentSuccess(data);
        break;
      case "payment.failed":
      case "payment.declined":
        await handlePaymentFailed(data);
        break;
      case "payment.refunded":
        await handlePaymentRefunded(data);
        break;
      default:
        console.log(`Unhandled webhook type: ${type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

async function handlePaymentSuccess(data: Record<string, unknown>) {
  const orderNumber = data.order_id as string;
  const providerRef = data.transaction_id as string;

  const order = await db.order.findFirst({
    where: { orderNumber },
    include: { payment: true },
  });

  if (!order) return console.error(`Order not found: ${orderNumber}`);

  await db.$transaction([
    db.order.update({
      where: { id: order.id },
      data: { paymentStatus: "PAID", status: "CONFIRMED" },
    }),
    db.payment.upsert({
      where: { orderId: order.id },
      update: { status: "PAID", providerRef, webhookData: data as object, paidAt: new Date() },
      create: {
        orderId: order.id,
        provider: "instapay",
        amount: order.total,
        currency: "EGP",
        status: "PAID",
        providerRef,
        webhookData: data as object,
        paidAt: new Date(),
      },
    }),
    db.orderStatusLog.create({
      data: { orderId: order.id, status: "CONFIRMED", note: `Payment confirmed. Ref: ${providerRef}` },
    }),
  ]);

  console.log(`Payment confirmed for order: ${orderNumber}`);
}

async function handlePaymentFailed(data: Record<string, unknown>) {
  const orderNumber = data.order_id as string;

  const order = await db.order.findFirst({ where: { orderNumber } });
  if (!order) return;

  await db.$transaction([
    db.order.update({ where: { id: order.id }, data: { paymentStatus: "FAILED" } }),
    db.payment.upsert({
      where: { orderId: order.id },
      update: { status: "FAILED", webhookData: data as object },
      create: { orderId: order.id, provider: "instapay", amount: order.total, currency: "EGP", status: "FAILED", webhookData: data as object },
    }),
    db.orderStatusLog.create({ data: { orderId: order.id, status: "PENDING", note: "Payment failed" } }),
  ]);
}

async function handlePaymentRefunded(data: Record<string, unknown>) {
  const orderNumber = data.order_id as string;
  const refundAmount = Number(data.refund_amount || 0);

  const order = await db.order.findFirst({ where: { orderNumber }, include: { payment: true } });
  if (!order) return;

  const isFullRefund = refundAmount >= Number(order.total);

  await db.$transaction([
    db.order.update({
      where: { id: order.id },
      data: { paymentStatus: isFullRefund ? "REFUNDED" : "PARTIALLY_REFUNDED", status: "REFUNDED" },
    }),
    db.payment.upsert({
      where: { orderId: order.id },
      update: {
        status: isFullRefund ? "REFUNDED" : "PARTIALLY_REFUNDED",
        webhookData: data as object,
        refundedAt: new Date(),
        refundAmount,
      },
      create: {
        orderId: order.id, provider: "instapay", amount: order.total, currency: "EGP",
        status: "REFUNDED", webhookData: data as object, refundedAt: new Date(), refundAmount,
      },
    }),
    db.orderStatusLog.create({ data: { orderId: order.id, status: "REFUNDED", note: `Refunded: EGP ${refundAmount}` } }),
  ]);
}
