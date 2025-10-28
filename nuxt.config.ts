// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/ui", "nuxt-auth-utils", "nuxt-authorization"],
  appConfig: {
    site: "https://cippus.naosi.org",
    title: "创新创业实践中心",
    description:
      "Sci-tech innovation system for contests, awards and applications.",
  },
  ui: {
    fonts: false,
  },
  routeRules: {
    "/": { isr: 3600 },
    "/**": { ssr: false },
  },
});
