import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number | string, currency = "EGP") {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return `${currency} ${num.toLocaleString("en-EG")}`;
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function calculateSavings(original: number, sale: number) {
  if (original <= sale) return { amount: 0, percent: 0 };
  const amount = original - sale;
  const percent = Math.round((amount / original) * 100);
  return { amount, percent };
}

export function truncate(str: string, length: number) {
  if (str.length <= length) return str;
  return str.slice(0, length) + "…";
}

export function generateOrderNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `DK-${timestamp}-${random}`;
}
