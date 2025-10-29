<script setup lang="ts">
const items = [
  {
    label: "返回主站",
    icon: "i-lucide-arrow-left-circle",
    to: "/",
  },
  {
    label: "公告管理",
    icon: "i-lucide-bell",
    to: "/admin/notices",
    value: "notices",
  },
];
</script>

<template>
  <UDashboardGroup>
    <UDashboardSidebar>
      <Logo />
      <UNavigationMenu :items="items" orientation="vertical" />
    </UDashboardSidebar>
    <UDashboardPanel>
      <slot />
    </UDashboardPanel>
  </UDashboardGroup>
</template>
