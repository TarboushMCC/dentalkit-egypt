import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");
    const categorySlug = searchParams.get("category");
    const featured = searchParams.get("featured") === "true";
    const search = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");

    let resolvedCategoryId = categoryId;
    if (categorySlug && !categoryId) {
      const cat = await db.category.findUnique({ where: { slug: categorySlug }, select: { id: true } });
      resolvedCategoryId = cat?.id ?? null;
    }

    const where = {
      isActive: true,
      ...(resolvedCategoryId && { categoryId: resolvedCategoryId }),
      ...(featured && { isFeatured: true }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { description: { contains: search, mode: "insensitive" as const } },
          { tags: { has: search } },
        ],
      }),
    };

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          _count: { select: { reviews: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.product.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: products,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Failed to fetch products" }, { status: 500 });
  }
}

const createSchema = z.object({
  name: z.string().min(2),
  nameAr: z.string().optional(),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  sku: z.string().min(2),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  price: z.number().positive(),
  comparePrice: z.number().positive().optional(),
  costPrice: z.number().positive().optional(),
  stock: z.number().int().min(0).default(0),
  weight: z.number().positive().optional(),
  images: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  isFeatured: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const data = createSchema.parse(body);

    const product = await db.product.create({ data: { ...data, isActive: true } });
    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Failed to create product" }, { status: 500 });
  }
}
