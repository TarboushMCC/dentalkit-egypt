import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const university = await db.university.findUnique({
      where: { id },
      include: {
        academicYears: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          include: { _count: { select: { packages: true } } },
        },
        _count: { select: { packages: true, studentProfiles: true } },
      },
    });

    if (!university) {
      return NextResponse.json({ success: false, error: "University not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: university });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Failed to fetch university" }, { status: 500 });
  }
}

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  nameAr: z.string().optional(),
  location: z.string().optional(),
  logo: z.string().url().optional(),
  website: z.string().url().optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const data = updateSchema.parse(body);

    const university = await db.university.update({ where: { id }, data });
    return NextResponse.json({ success: true, data: university });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Failed to update university" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    await db.university.update({ where: { id }, data: { isActive: false } });
    return NextResponse.json({ success: true, message: "University deactivated" });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to delete university" }, { status: 500 });
  }
}
