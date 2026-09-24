<script setup lang="ts">
const appConfig = useAppConfig();
const { loggedIn, user, clear } = useUserSession();

const navItems = computed(() => {
  const links = [
    {
      label: "公告",
      to: "/notices",
    },
    {
      label: "收录竞赛",
      to: "/contests",
    },
  ];
  if (user.value) {
    links.push({ label: "奖项审核", to: "/reviews" });
    links.push({ label: "积分申报", to: "/activities" });
  }
  if (user.value?.admin) {
    links.push({
      label: "管理后台",
      to: "/admin/notices",
    });
  }
  return links;
});

const userItems = computed(() => {
  if (loggedIn.value) {
    return [
      {
        label: "个人资料",
        to: `/users/${user.value?.username}`,
        icon: "i-lucide-user-round",
      },
      { label: "退出登录", onSelect: clear, icon: "i-lucide-log-out" },
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

// 未读站内信数量：登录后才请求（接口需要会话）
const route = useRoute();
const { data: notificationData, refresh: refreshNotifications } = await useFetch<{
  notifications: unknown[];
  unreadCount: number;
}>("/api/notifications", {
  immediate: false,
  default: () => ({ notifications: [], unreadCount: 0 }),
});

if (loggedIn.value) {
  await refreshNotifications();
}

const unreadCount = computed(() => notificationData.value?.unreadCount || 0);

const avatarUrl = computed(() =>
  user.value?.avatar ? `/images/${user.value.avatar}` : undefined,
);

// 路由切换时刷新（在站内信页标记已读后返回，红点会同步更新）
watch(
  () => route.fullPath,
  () => {
    if (loggedIn.value) {
      refreshNotifications();
    }
  },
);
</script>

<template>
  <UHeader>
    <template #title>
      <Logo />
    </template>
    <UNavigationMenu :items="navItems" />
    <template #right>
      <div v-if="loggedIn" class="relative">
        <UButton
          to="/notifications"
          color="neutral"
          variant="ghost"
          icon="i-lucide-bell"
          aria-label="站内信"
        />
        <span
          v-if="unreadCount > 0"
          class="pointer-events-none absolute -top-0.5 -right-0.5 flex h-3 min-w-3 items-center justify-center rounded-full bg-error px-0.5 text-[8px] font-medium leading-none text-inverted tabular-nums"
        >
          {{ unreadCount > 99 ? "99+" : unreadCount }}
        </span>
      </div>
      <UDropdownMenu :items="userItems">
        <div>
          <UAvatar
            v-if="loggedIn && (avatarUrl || user?.name)"
            class="cursor-pointer"
            :src="avatarUrl"
            :alt="user?.name || user?.username"
            :text="user?.name?.[0]"
          />
          <UAvatar v-else class="cursor-pointer" icon="i-lucide-user-round" />
        </div>
      </UDropdownMenu>
    </template>
    <template #body>
      <UNavigationMenu :items="navItems" orientation="vertical" />
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
