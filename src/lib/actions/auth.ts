"use server";

import { signIn, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  callbackUrl: z.string().optional(),
});

export async function loginAction(formData: FormData) {
  const raw = Object.fromEntries(formData);
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: parsed.data.callbackUrl || "/dashboard",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("CredentialsSignin")) return { error: "Invalid email or password" };
    if (message.includes("NEXT_REDIRECT")) throw err;
    return { error: "Something went wrong. Please try again." };
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  universityId: z.string().optional(),
  yearId: z.string().optional(),
});

export async function registerAction(data: z.infer<typeof registerSchema>) {
  const parsed = registerSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.data };

  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3006"}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });

  const result = await res.json();
  if (!result.success) return { error: result.error };

  // Auto sign-in after registration
  await signIn("credentials", {
    email: parsed.data.email,
    password: parsed.data.password,
    redirectTo: "/dashboard",
  });
}
