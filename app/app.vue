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

/* 卡片跟随鼠标的聚光：画在卡片背景之上、内容之下，由 v-spotlight 指令写入坐标。
   光斑大小与强度可用 --spotlight-size / --spotlight-strength 调整。 */
[data-spotlight-active] {
  background-image: radial-gradient(
    var(--spotlight-size, 400px) var(--spotlight-size, 400px) at
      var(--spotlight-x, 0px) var(--spotlight-y, 0px),
    color-mix(in oklab, var(--ui-primary) var(--spotlight-strength, 12%), transparent),
    transparent 70%
  );
  background-repeat: no-repeat;
}
</style>
