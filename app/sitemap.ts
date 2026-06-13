import type { MetadataRoute } from "next";

const baseUrl = "https://distribucioneslym.com";

const publicRoutes = [
  "",
  "/contacto",
  "/domicilios",
  "/estado-pedido",
  "/guias",
  "/nosotros",
  "/ofertas",
  "/politicas",
  "/servicios",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
