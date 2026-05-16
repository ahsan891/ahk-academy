import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/teacher/", "/student/", "/api/"],
    },
    sitemap: "https://ahkacademy.pro/sitemap.xml",
  };
}
