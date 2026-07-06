<script setup lang="ts">
const appConfig = useAppConfig();
const keyword = ref("");

function search() {
  navigateTo({ path: "/search", query: { q: keyword.value } });
}
</script>

<template>
  <UContainer>
    <UPageCTA
      variant="naked"
      :title="appConfig.title"
      :description="appConfig.description"
      orientation="horizontal"
    >
      <img src="/logo.svg" alt="logo" />

      <template #links>
        <UFieldGroup class="w-full max-w-2xl">
          <UInput
            v-model="keyword"
            class="w-full"
            size="xl"
            icon="i-lucide-search"
            placeholder="搜索公告、竞赛或用户"
            @keydown.enter="search"
          />
          <UButton size="xl" icon="i-lucide-search" label="搜索" @click="search" />
        </UFieldGroup>
      </template>
    </UPageCTA>
  </UContainer>
</template>
