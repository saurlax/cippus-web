<script setup lang="ts">
const appConfig = useAppConfig();
const { loggedIn } = useUserSession();
const links = computed(() => {
  if (!loggedIn.value) {
    return [{ label: "登录", to: "/login" }];
  }
});
</script>

<template>
  <UPageCTA
    :title="appConfig.title"
    :description="appConfig.description"
    :links="links"
    orientation="horizontal"
  >
    <img src="/logo.svg" alt="logo" />
  </UPageCTA>
</template>
