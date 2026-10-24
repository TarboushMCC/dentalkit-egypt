"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function addToCart(input: { productId?: string; packageId?: string; quantity?: number }) {
  const session = await auth();
  if (!session) return { success: false, error: "Please sign in to add items to cart" };

  const { productId, packageId, quantity = 1 } = input;
  if (!productId && !packageId) return { success: false, error: "Invalid item" };

  try {
    const existing = await db.cartItem.findFirst({
      where: { userId: session.user.id, productId: productId || null, packageId: packageId || null },
    });

    if (existing) {
      await db.cartItem.update({
        where: { id: existing.id },
        data: { quantity: Math.min(existing.quantity + quantity, 10) },
      });
    } else {
      await db.cartItem.create({
        data: { userId: session.user.id, productId, packageId, quantity },
      });
    }

    revalidatePath("/cart");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to add to cart" };
  }
}

export async function removeFromCart(itemId: string) {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    await db.cartItem.deleteMany({ where: { id: itemId, userId: session.user.id } });
    revalidatePath("/cart");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to remove item" };
  }
}

export async function updateCartQuantity(itemId: string, quantity: number) {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  if (quantity < 1 || quantity > 10) return { success: false, error: "Invalid quantity" };

  try {
    await db.cartItem.updateMany({ where: { id: itemId, userId: session.user.id }, data: { quantity } });
    revalidatePath("/cart");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update quantity" };
  }
}

export async function clearCart() {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    await db.cartItem.deleteMany({ where: { userId: session.user.id } });
    revalidatePath("/cart");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to clear cart" };
  }
}

export async function getCartCount() {
  const session = await auth();
  if (!session) return 0;

  try {
    const result = await db.cartItem.aggregate({ where: { userId: session.user.id }, _sum: { quantity: true } });
    return result._sum.quantity || 0;
  } catch {
    return 0;
  }
}
