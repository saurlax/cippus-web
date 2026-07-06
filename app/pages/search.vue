<script setup lang="ts">
const route = useRoute();
const router = useRouter();

const searchTypes = [
  { label: "公告", value: "notices", icon: "i-lucide-megaphone" },
  { label: "竞赛", value: "contests", icon: "i-lucide-trophy" },
  { label: "用户", value: "users", icon: "i-lucide-users" },
];

const keyword = ref(String(route.query.q || ""));
const activeType = ref(String(route.query.type || "notices"));

const { data: results, status } = await useFetch<any[]>("/api/search", {
  query: { q: keyword, type: activeType },
  default: () => [],
});

const typeItems = computed(() =>
  searchTypes.map((item) => ({
    ...item,
    active: activeType.value === item.value,
    onSelect: () => selectType(item.value),
  })),
);

const title = computed(() => {
  return searchTypes.find((item) => item.value === activeType.value)?.label || "公告";
});

function selectType(type: string) {
  activeType.value = type;
  updateQuery();
}

function updateQuery() {
  router.replace({
    path: "/search",
    query: {
      ...(keyword.value ? { q: keyword.value } : {}),
      ...(activeType.value !== "notices" ? { type: activeType.value } : {}),
    },
  });
}

function resultTitle(item: any) {
  return item.title || item.name || item.username;
}

function resultDescription(item: any) {
  if (activeType.value === "users") {
    return [item.college, item.bio].filter(Boolean).join(" / ") || "暂无简介";
  }

  return String(item.description || item.content || "").slice(0, 140);
}

function resultLink(item: any) {
  if (activeType.value === "users") {
    return `/users/${item.username}`;
  }

  if (activeType.value === "contests") {
    return `/contests/${item.id}`;
  }

  return `/notices/${item.id}`;
}
</script>

<template>
  <UContainer>
    <UPageHeader title="搜索" description="搜索公告、竞赛和用户资料卡片。" />
    <UPageBody>
      <UFieldGroup class="mb-6 w-full">
        <UInput
          v-model="keyword"
          class="w-full"
          icon="i-lucide-search"
          placeholder="输入关键词"
          @keydown.enter="updateQuery"
        />
        <UButton icon="i-lucide-search" label="搜索" @click="updateQuery" />
      </UFieldGroup>

      <div class="grid gap-6 md:grid-cols-[220px_1fr]">
        <aside>
          <UNavigationMenu :items="typeItems" orientation="vertical" />
        </aside>

        <section class="space-y-4">
          <div class="flex items-center justify-between gap-4">
            <h2 class="text-lg font-semibold">{{ title }}</h2>
            <UBadge color="neutral" variant="outline">
              {{ results?.length || 0 }} 条结果
            </UBadge>
          </div>

          <UPageCard
            v-for="item in results"
            :key="`${activeType}-${item.id}`"
            :title="resultTitle(item)"
            :description="resultDescription(item)"
            :to="resultLink(item)"
            icon="i-lucide-arrow-up-right"
          />

          <UEmpty
            v-if="status !== 'pending' && !results?.length"
            variant="naked"
            title="没有找到结果"
          />
        </section>
      </div>
    </UPageBody>
  </UContainer>
</template>