import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  universityId: z.string().optional(),
  yearId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    // Check if user already exists
    const existing = await db.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await db.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        studentProfile: {
          create: {
            universityId: data.universityId || null,
            yearId: data.yearId || null,
          },
        },
      },
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: err.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Registration error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}
