import { MetadataRoute } from "next";

const BASE_URL = "https://dentalkit.eg";

const universities = [
  "cairo-university", "ain-shams-university", "alexandria-university",
  "future-university-egypt", "misr-international-university",
  "october-6-university", "badr-university", "british-university-egypt",
  "nahda-university", "delta-university",
];

const packageSlugs = [
  "cairo-year-1-starter", "cairo-year-2-clinical", "cairo-year-3-operative",
  "ain-shams-year-1", "ain-shams-year-2", "alex-year-1",
  "future-year-1", "miu-year-2",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 1.0 },
    { url: `${BASE_URL}/find-kit`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${BASE_URL}/universities`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${BASE_URL}/packages`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.9 },
    { url: `${BASE_URL}/products`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.7 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${BASE_URL}/faq`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.6 },
  ];

  const universityPages = universities.map((slug) => ({
    url: `${BASE_URL}/universities/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const packagePages = packageSlugs.map((slug) => ({
    url: `${BASE_URL}/packages/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  return [...staticPages, ...universityPages, ...packagePages];
}
