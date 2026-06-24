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
    public: {
      casBaseUrl: "https://sso.dlut.edu.cn/cas",
      casServiceUrl:
        "https%3A%2F%2Fwebvpn.dlut.edu.cn%2Fhttp-3000%2F57787a7876706e323032336b6579402474170119f00b9c5dbe%2Fapi%2Fcas",
    },
  },
  i18n: {
    defaultLocale: "zh",
    locales: [{ code: "zh", file: "zh.json" }],
  },
});
