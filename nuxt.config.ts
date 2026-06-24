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
    "nuxt-nodemailer",
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
  nodemailer: {
    from: "",
    host: "",
    port: 587,
    secure: false,
    auth: {
      user: "",
      pass: "",
    },
  },
  runtimeConfig: {
    casBaseUrl: "https://sso.dlut.edu.cn/cas",
    casServiceUrl:
      "https://webvpn.dlut.edu.cn/http-3000/57787a7876706e323032336b6579402474170119f00b9c5dbe/api/cas",
  },
  i18n: {
    defaultLocale: "zh",
    locales: [{ code: "zh", file: "zh.json" }],
  },
});
