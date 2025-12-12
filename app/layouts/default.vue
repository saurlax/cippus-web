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
      label: "赛事",
      to: "/contests",
    },
    {
      label: "申报",
      to: "/activities",
    },
  ];
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
      { label: "个人中心", to: `/users/${user.value?.username}` },
      { label: "退出登录", onSelect: clear },
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
      <Logo />
    </template>
    <UNavigationMenu :items="navItems" />
    <template #right>
      <UDropdownMenu :items="userItems">
        <div>
          <UAvatar
            v-if="loggedIn && user?.name"
            class="cursor-pointer"
            :text="user.name?.[0]"
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
