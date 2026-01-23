<script setup lang="ts">
const appConfig = useAppConfig();
const supabase = useSupabaseClient();

const user = useSupabaseUser();

const logout = async () => {
  await supabase.auth.signOut();
  navigateTo("/login");
};

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
  if (user.value) {
    return [
      { label: "个人中心", to: `/users/${user.value?.username}` },
      { label: "退出登录", onSelect: logout },
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
      <UColorModeButton />
      <UDropdownMenu :items="userItems">
        <div>
          <UAvatar v-if="user" class="cursor-pointer" :text="user.email" />
          <UAvatar v-else class="cursor-pointer" icon="i-lucide-user-round" />
        </div>
      </UDropdownMenu>
    </template>
    <template #body>
      <UNavigationMenu :items="navItems" orientation="vertical" />
    </template>
  </UHeader>
  <UMain>
    ->{{ user }}<-
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
