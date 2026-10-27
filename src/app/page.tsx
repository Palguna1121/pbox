import { Hero } from "@/components/Hero";
import { FAQ, HowItWorks } from "@/components/HowItWorks";
import { JsonLd } from "@/components/seo/JsonLd";
import { site, siteUrl } from "@/lib/site";

export default function Home() {
  const url = siteUrl();
  return (
    <main>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: site.name,
            url,
            inLanguage: "id-ID",
            description: site.description,
          },
          {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: site.name,
            url,
            applicationCategory: "PhotographyApplication",
            operatingSystem: "Any (browser modern)",
            inLanguage: "id-ID",
            description: site.description,
            browserRequirements: "Membutuhkan JavaScript, Canvas, dan getUserMedia untuk kamera.",
            featureList: [
              "Photobox dengan frame 1, 2, atau 4 slot",
              "Stiker, teks, kuas, dan layer",
              "10 preset filter retro dan penyesuaian manual",
              "Pas foto 2x3, 3x4, 4x6 cm dengan ganti warna latar",
              "Hapus latar di perangkat",
              "Bagikan lewat tautan dan QR",
              "Cetak 4R, strip 2x6, A6, dan lembar pas foto",
            ],
            offers: { "@type": "Offer", price: "0", priceCurrency: "IDR" },
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
        ]}
      />
      <Hero />
      <HowItWorks />
    </main>
  );
}
