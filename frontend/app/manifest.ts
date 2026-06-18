// Web App Manifest for Filmy7 PWA
import { siteOrigin } from "@/seo/base"

export default function manifest() {
  return {
    name: "Filmy7 — фильмы и сериалы онлайн",
    short_name: "Filmy7",
    description:
      "Смотрите новые фильмы и сериалы онлайн бесплатно в HD с русскими субтитрами.",
    start_url: "/",
    display: "standalone",

    orientation: "portrait-primary",
    scope: "/",
    lang: "ru-RU",
    categories: ["entertainment", "movies", "video"],

    shortcuts: [
      {
        name: "Фильмы",
        short_name: "Фильмы",
        description: "Новинки и популярные фильмы",
        url: "/filmi",
      },
      {
        name: "Сериалы",
        short_name: "Сериалы",
        description: "Сериалы онлайн",
        url: "/seriali",
      },
      {
        name: "Поиск",
        short_name: "Поиск",
        description: "Искать фильмы и сериалы",
        url: "/search",
      },
      {
        name: "Популярное",
        short_name: "Топ",
        description: "Самые просматриваемые фильмы",
        url: "/trending",
      },
    ],
    related_applications: [
      {
        platform: "webapp",
        url: `${siteOrigin}/manifest.webmanifest`,
      },
    ],
    prefer_related_applications: false,
  }
}
