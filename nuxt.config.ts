// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: [
    "@nuxt/ui",
    "@nuxtjs/mdc",
    "nuxt-auth-utils",
    "@nuxthub/core",
    "@nuxtjs/i18n",
  ],
  routeRules: {
    "/admin/**": { appLayout: "admin" },
  },
  ui: {
    fonts: false,
  },
  hub: {
    db: "postgresql",
    blob: true,
  },
  i18n: {
    defaultLocale: "zh",
    locales: [{ code: "zh", file: "zh.json" }],
  },
});
