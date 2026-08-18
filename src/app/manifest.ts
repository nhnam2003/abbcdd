import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  const primary = process.env.NEXT_PUBLIC_COLOR_PRIMARY ?? "#A07828";

  return {
    name: "May Center - Dạy đàn Guitar tại Đà Nẵng",
    short_name: "May Center",
    description:
      "Trung tâm dạy đàn guitar tại Đà Nẵng — khóa học từ cơ bản đến nâng cao, giảng viên tận tâm, lộ trình bài bản.",
    lang: "vi",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: primary,
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-512x512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
