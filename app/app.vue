<script setup lang="ts">
import { zh_cn } from "@nuxt/ui/locale";
const appConfig = useAppConfig();
useHead({
  titleTemplate: (title) =>
    title ? `${title} - ${appConfig.title}` : appConfig.title,
});
</script>

<template>
  <UApp :locale="zh_cn">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<style>
@import "tailwindcss";
@import "@nuxt/ui";

@theme {
  --color-primary: #0b1876;
}
</style>
