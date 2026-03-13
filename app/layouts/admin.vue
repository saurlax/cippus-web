<script setup lang="ts">
const { user } = useUserSession();

if (!user.value || !user.value.admin) {
  navigateTo("/");
}

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
  {
    label: "奖项管理",
    icon: "i-lucide-award",
    to: "/admin/awards",
    value: "awards",
  },
  {
    label: "论文管理",
    icon: "i-lucide-file-text",
    to: "/admin/papers",
    value: "papers",
  },
  {
    label: "专利管理",
    icon: "i-lucide-copyright",
    to: "/admin/patents",
    value: "patents",
  },
  {
    label: "大创管理",
    icon: "i-lucide-lightbulb",
    to: "/admin/innovations",
    value: "innovations",
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
