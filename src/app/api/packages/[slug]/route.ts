import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    const pkg = await db.package.findUnique({
      where: { slug },
      include: {
        university: { select: { id: true, name: true, slug: true, logo: true } },
        year: { select: { id: true, name: true, slug: true, yearNumber: true } },
        items: {
          orderBy: { sortOrder: "asc" },
          include: {
            product: {
              select: { id: true, name: true, slug: true, price: true, images: true, description: true },
            },
          },
        },
        reviews: {
          where: { isApproved: true },
          include: { user: { select: { name: true, image: true } } },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: { select: { items: true, reviews: true } },
      },
    });

    if (!pkg || !pkg.isActive) {
      return NextResponse.json({ success: false, error: "Package not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: pkg });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch package" }, { status: 500 });
  }
}

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  nameAr: z.string().optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  comparePrice: z.number().positive().optional(),
  stock: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isRequired: z.boolean().optional(),
  images: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  sortOrder: z.number().int().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const session = await auth();
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const { slug } = await params;
    const body = await req.json();
    const data = updateSchema.parse(body);

    const pkg = await db.package.update({ where: { slug }, data });
    return NextResponse.json({ success: true, data: pkg });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Failed to update package" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const session = await auth();
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const { slug } = await params;
    await db.package.update({ where: { slug }, data: { isActive: false } });
    return NextResponse.json({ success: true, message: "Package deactivated" });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to delete package" }, { status: 500 });
  }
}
