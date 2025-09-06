<script setup lang="ts">
const appConfig = useAppConfig();
const links = ref([{ label: "登录", to: "/login" }]);
</script>

<template>
  <UPageCTA
    :title="appConfig.name"
    :description="appConfig.description"
    :links="links"
    orientation="horizontal"
  >
    <img src="/logo.svg" alt="logo" />
  </UPageCTA>
</template>
