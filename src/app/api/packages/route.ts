import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const universityId = searchParams.get("universityId");
    const universitySlug = searchParams.get("university");
    const yearId = searchParams.get("yearId");
    const yearSlug = searchParams.get("year");
    const featured = searchParams.get("featured") === "true";
    const required = searchParams.get("required") === "true";
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");

    // Resolve slug to ID if provided
    let resolvedUniversityId = universityId;
    if (universitySlug && !universityId) {
      const uni = await db.university.findUnique({ where: { slug: universitySlug }, select: { id: true } });
      resolvedUniversityId = uni?.id ?? null;
    }

    let resolvedYearId = yearId;
    if (yearSlug && resolvedUniversityId && !yearId) {
      const year = await db.academicYear.findUnique({
        where: { universityId_slug: { universityId: resolvedUniversityId, slug: yearSlug } },
        select: { id: true },
      });
      resolvedYearId = year?.id ?? null;
    }

    const where = {
      isActive: true,
      ...(resolvedUniversityId && { universityId: resolvedUniversityId }),
      ...(resolvedYearId && { yearId: resolvedYearId }),
      ...(featured && { isFeatured: true }),
      ...(required && { isRequired: true }),
    };

    const [packages, total] = await Promise.all([
      db.package.findMany({
        where,
        include: {
          university: { select: { id: true, name: true, slug: true, logo: true } },
          year: { select: { id: true, name: true, slug: true, yearNumber: true } },
          _count: { select: { items: true, reviews: true } },
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.package.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: packages,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Failed to fetch packages" }, { status: 500 });
  }
}

const itemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive().default(1),
  note: z.string().optional(),
  sortOrder: z.number().int().default(0),
});

const createSchema = z.object({
  name: z.string().min(2),
  nameAr: z.string().optional(),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  universityId: z.string(),
  yearId: z.string(),
  price: z.number().positive(),
  comparePrice: z.number().positive().optional(),
  stock: z.number().int().min(0).default(0),
  isRequired: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  images: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  items: z.array(itemSchema).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { items, ...packageData } = createSchema.parse(body);

    const pkg = await db.$transaction(async (tx: Parameters<Parameters<typeof db.$transaction>[0]>[0]) => {
      const created = await tx.package.create({ data: { ...packageData, isActive: true } });
      if (items?.length) {
        await tx.packageItem.createMany({
          data: items.map((item) => ({ ...item, packageId: created.id })),
        });
      }
      return created;
    });

    return NextResponse.json({ success: true, data: pkg }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Failed to create package" }, { status: 500 });
  }
}
