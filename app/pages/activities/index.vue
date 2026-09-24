<script setup lang="ts">
const { data: activities } = await useFetch("/api/activities");

// 描述固定行数截断，避免长活动简介把卡片撑高；text-wrap 用于消除与 line-clamp 省略号的冲突
const descriptionClamp = "line-clamp-4 text-wrap";

const posts = computed(() => {
  return activities.value?.map((activity: any) => {
    return {
      title: activity.name,
      description: activity.description || "",
      date: activity.startDate,
      to: `/activities/${activity.id}`,
      ui: { description: descriptionClamp },
    };
  });
});
</script>

<template>
  <UContainer>
    <UPageHeader title="申报列表" />
    <UPageBody>
      <UBlogPosts v-spotlight :posts />
    </UPageBody>
  </UContainer>
</template>
