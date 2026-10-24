import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get("active") !== "false";

    const universities = await db.university.findMany({
      where: activeOnly ? { isActive: true } : {},
      include: {
        _count: { select: { packages: true, studentProfiles: true } },
        academicYears: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          select: { id: true, name: true, slug: true, yearNumber: true },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ success: true, data: universities });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Failed to fetch universities" }, { status: 500 });
  }
}

const createSchema = z.object({
  name: z.string().min(2),
  nameAr: z.string().optional(),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  location: z.string().optional(),
  logo: z.string().url().optional(),
  website: z.string().url().optional(),
  description: z.string().optional(),
  sortOrder: z.number().int().default(0),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const data = createSchema.parse(body);

    const existing = await db.university.findUnique({ where: { slug: data.slug } });
    if (existing) {
      return NextResponse.json({ success: false, error: "A university with this slug already exists" }, { status: 409 });
    }

    const university = await db.university.create({ data: { ...data, isActive: true } });
    return NextResponse.json({ success: true, data: university }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Failed to create university" }, { status: 500 });
  }
}
