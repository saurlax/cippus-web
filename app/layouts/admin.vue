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
  {
    label: "赛事管理",
    icon: "i-lucide-trophy",
    to: "/admin/contests",
    value: "contests",
  },
  {
    label: "申报管理",
    icon: "i-lucide-activity",
    to: "/admin/activities",
    value: "activities",
  },
  {
    label: "用户管理",
    icon: "i-lucide-users",
    to: "/admin/users",
    value: "users",
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
