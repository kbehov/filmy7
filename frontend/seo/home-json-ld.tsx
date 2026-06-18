import {
  siteDefaultDescription,
  siteDefaultTitle,
  siteOrigin,
} from "@/seo/base"

export function HomeJsonLd() {
  const homeUrl = `${siteOrigin}/`
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${homeUrl}#website`,
        url: homeUrl,
        name: "Filmy7",
        alternateName: ["filmy7", "filmy7.com"],
        description: siteDefaultDescription,
        inLanguage: "pl-PL",
        publisher: { "@id": `${homeUrl}#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${siteOrigin}/search?term={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${homeUrl}#organization`,
        name: "Filmy7",
        url: homeUrl,
        logo: `${siteOrigin}/filmi9-logo.png`,
      },
      {
        "@type": "WebPage",
        "@id": `${homeUrl}#webpage`,
        url: homeUrl,
        name: siteDefaultTitle,
        description: siteDefaultDescription,
        isPartOf: { "@id": `${homeUrl}#website` },
        inLanguage: "pl-PL",
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
