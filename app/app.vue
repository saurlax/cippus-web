<script setup lang="ts">
const appConfig = useAppConfig();
useHead({
  titleTemplate: (title) =>
    title ? `${title} - ${appConfig.title}` : appConfig.title,
});

onMounted(() => {
  console.log(
    String.raw`%c
███╗   ██╗ █████╗  ██████╗ ███████╗██╗
████╗  ██║██╔══██╗██╔═══██╗██╔════╝██║
██╔██╗ ██║███████║██║   ██║███████╗██║
██║╚██╗██║██╔══██║██║   ██║╚════██║██║
██║ ╚████║██║  ██║╚██████╔╝███████║██║
╚═╝  ╚═══╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝`,
    "color: green;"
  );
  console.log("Powered by NAOSI-DLUT. https://naosi.org/");
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
