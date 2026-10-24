import type { Metadata } from "next";
import { Figtree, Noto_Sans, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "@/components/providers/SessionProvider";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const notoSans = Noto_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "DentalKit Egypt — Dental Equipment Packages for Egyptian Students",
    template: "%s | DentalKit Egypt",
  },
  description:
    "Egypt's first dedicated marketplace for dental students. Find the exact equipment packages required by your university and academic year. Cairo University, Ain Shams, Alexandria, and more.",
  keywords: [
    "dental kit Egypt", "dental student equipment", "dental instruments Egypt",
    "Cairo University dental kit", "Ain Shams dental equipment",
    "dental package Egypt", "dentistry student Egypt", "dental tools Egypt",
  ],
  authors: [{ name: "DentalKit Egypt" }],
  creator: "DentalKit Egypt",
  metadataBase: new URL("https://dentalkit.eg"),
  openGraph: {
    type: "website", locale: "en_EG", url: "https://dentalkit.eg",
    title: "DentalKit Egypt — Dental Equipment for Dental Students",
    description: "Find your required dental equipment packages based on your university and academic year.",
    siteName: "DentalKit Egypt",
  },
  twitter: {
    card: "summary_large_image",
    title: "DentalKit Egypt",
    description: "Dental equipment packages for Egyptian dental students.",
  },
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${figtree.variable} ${notoSans.variable} ${geistMono.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col antialiased">
        <SessionProvider>
          {children}
          <Toaster position="bottom-right" richColors />
        </SessionProvider>
      </body>
    </html>
  );
}
