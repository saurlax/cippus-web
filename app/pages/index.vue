<script setup lang="ts">
const appConfig = useAppConfig();
</script>

<template>
  <UPageCTA
    :title="appConfig.title"
    :description="appConfig.description"
    orientation="horizontal"
  >
    <img src="/logo.svg" alt="logo" />
  </UPageCTA>
</template>
