<script setup lang="ts">
const appConfig = useAppConfig();
useHead({
  titleTemplate: (title) =>
    title ? `${title} - ${appConfig.title}` : appConfig.title,
});
</script>

<template>
  <UApp>
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
