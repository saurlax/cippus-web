// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/ui", "@nuxtjs/mdc", "@nuxtjs/supabase"],
  appConfig: {
    site: "https://cippus.naosi.org",
    title: "创新创业实践中心",
    description:
      "Sci-tech innovation system for contests, awards and applications.",
    casBaseUrl: process.env.CAS_BASE_URL ?? "https://sso.dlut.edu.cn/cas",
    casServiceUrl:
      process.env.CAS_SERVICE_URL ??
      "https%3A%2F%2Fwebvpn.dlut.edu.cn%2Fhttp-3000%2F57787a7876706e323032336b6579402474170119f00b9c5dbe%2Fapi%2Fcas",
  },
  ui: {
    fonts: false,
  },
  routeRules: {
    "/": { prerender: true },
    "/activities": { isr: 3600 },
    "/contests": { isr: 3600 },
    "/notices": { isr: 3600 },
    "/users": { isr: 3600 },
    "/admin/**": { ssr: false },
  },
});