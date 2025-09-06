<script setup lang="ts">
const appConfig = useAppConfig();
useHead({
  titleTemplate: (title) =>
    title ? `${title} - ${appConfig.name}` : appConfig.name,
});

onMounted(() => {
  console.log(
    String.raw`%c
 __   __     ______     ______     ______     __
/\ "-.\ \   /\  __ \   /\  __ \   /\  ___\   /\ \
\ \ \-.  \  \ \  __ \  \ \ \/\ \  \ \___  \  \ \ \
 \ \_\\"\_\  \ \_\ \_\  \ \_____\  \/\_____\  \ \_\
  \/_/ \/_/   \/_/\/_/   \/_____/   \/_____/   \/_/
`,
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
