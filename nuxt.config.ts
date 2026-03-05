// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/ui", "@nuxtjs/mdc", "nuxt-auth-utils", "@nuxthub/core"],
  ui: {
    fonts: false,
  },
  hub: {
    db: "postgresql",
  },
  routeRules: {
    "/admin/**": { appLayout: "admin" },
  },
});
