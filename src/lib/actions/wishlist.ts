"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function toggleWishlist(input: { productId?: string; packageId?: string }) {
  const session = await auth();
  if (!session) return { success: false, error: "Please sign in to save items" };

  const { productId, packageId } = input;
  if (!productId && !packageId) return { success: false, error: "Invalid item" };

  try {
    const existing = await db.wishlistItem.findFirst({
      where: { userId: session.user.id, productId: productId || null, packageId: packageId || null },
    });

    if (existing) {
      await db.wishlistItem.delete({ where: { id: existing.id } });
      revalidatePath("/dashboard/wishlist");
      return { success: true, action: "removed" as const };
    }

    await db.wishlistItem.create({
      data: { userId: session.user.id, productId, packageId },
    });

    revalidatePath("/dashboard/wishlist");
    return { success: true, action: "added" as const };
  } catch {
    return { success: false, error: "Failed to update wishlist" };
  }
}

export async function isWishlisted(input: { productId?: string; packageId?: string }) {
  const session = await auth();
  if (!session) return false;

  try {
    const item = await db.wishlistItem.findFirst({
      where: {
        userId: session.user.id,
        productId: input.productId || null,
        packageId: input.packageId || null,
      },
    });
    return !!item;
  } catch {
    return false;
  }
}
