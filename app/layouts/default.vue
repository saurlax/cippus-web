<script setup lang="ts">
const appConfig = useAppConfig();
const { loggedIn, clear } = useUserSession();

const navItems = ref([
  {
    label: "通知",
    to: "/notices",
  },
  {
    label: "赛事",
    to: "/contests",
  },
  {
    label: "申报",
    to: "/activities",
  },
]);

const userItems = computed(() => {
  if (loggedIn.value) {
    return [
      { label: "个人中心", to: "/profile" },
      { label: "注销登录", onSelect: clear },
    ];
  } else {
    return [
      {
        label: "登录",
        to: "/login",
      },
    ];
  }
});
</script>

<template>
  <UHeader>
    <template #title>
      <img src="/logo.svg" alt="logo" class="h-8" />
    </template>
    <UNavigationMenu :items="navItems" />
    <template #right>
      <UDropdownMenu :items="userItems">
        <UAvatar icon="i-lucide-user-round" />
      </UDropdownMenu>
    </template>
  </UHeader>
  <UMain>
    <slot />
  </UMain>
  <USeparator type="dashed" />
  <UFooter>
    <template #left>
      <p class="text-muted text-sm">
        Copyright © {{ new Date().getFullYear() }} {{ appConfig.title }}.
      </p>
    </template>
  </UFooter>
</template>
