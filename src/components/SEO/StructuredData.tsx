export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "DentalKit Egypt",
    url: "https://dentalkit.eg",
    logo: "https://dentalkit.eg/logo.png",
    description: "Egypt's first dedicated marketplace for dental students to purchase university-required equipment packages.",
    address: { "@type": "PostalAddress", addressLocality: "Cairo", addressCountry: "EG" },
    contactPoint: { "@type": "ContactPoint", telephone: "+20-123-456-7890", contactType: "customer service", availableLanguage: ["Arabic", "English"] },
    sameAs: ["https://www.instagram.com/dentalkit_eg", "https://www.facebook.com/dentalkitegypt"],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

export function WebsiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "DentalKit Egypt",
    url: "https://dentalkit.eg",
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: "https://dentalkit.eg/packages?q={search_term_string}" },
      "query-input": "required name=search_term_string",
    },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

export function ProductSchema({ product }: { product: { name: string; description?: string; price: number; comparePrice?: number; images?: string[]; rating?: number; reviewCount?: number } }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images?.[0],
    brand: { "@type": "Brand", name: "DentalKit Egypt" },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "EGP",
      availability: "https://schema.org/InStock",
      seller: { "@type": "Organization", name: "DentalKit Egypt" },
      ...(product.comparePrice && { priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() }),
    },
    ...(product.rating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.rating,
        reviewCount: product.reviewCount || 0,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

export function FAQSchema({ faqs }: { faqs: { q: string; a: string }[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

export function BreadcrumbSchema({ items }: { items: { name: string; url: string }[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}
