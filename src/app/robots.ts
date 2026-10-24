import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/dashboard", "/api/", "/checkout/", "/_next/"],
      },
      {
        userAgent: "GPTBot",
        allow: ["/", "/find-kit", "/universities", "/packages", "/products", "/faq", "/about"],
      },
      {
        userAgent: "Claude-Web",
        allow: ["/", "/find-kit", "/universities", "/packages", "/products", "/faq", "/about"],
      },
    ],
    sitemap: "https://dentalkit.eg/sitemap.xml",
    host: "https://dentalkit.eg",
  };
}
