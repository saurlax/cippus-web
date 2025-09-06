<script setup lang="ts">
const appConfig = useAppConfig();

const items = ref([
  {
    label: "通知",
    to: "/notices",
  },
  {
    label: "赛事",
    to: "/contests",
  },
  {
    label: "群组",
    to: "/groups",
  },
]);
</script>

<template>
  <UHeader>
    <template #title>
      <img src="/logo.svg" alt="logo" class="h-8" />
    </template>
    <UNavigationMenu :items="items" />
    <template #right>
      <UAvatar icon="i-lucide-user-round" />
    </template>
  </UHeader>
  <UMain>
    <slot />
  </UMain>
  <USeparator type="dashed" />
  <UFooter>
    <template #left>
      <p class="text-muted text-sm">
        Copyright © {{ new Date().getFullYear() }} {{ appConfig.name }}.
      </p>
    </template>
  </UFooter>
</template>
