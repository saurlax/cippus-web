<script setup lang="ts">
const { data: notices } = await useFetch("/api/notices");

// 描述固定行数截断，避免长内容把卡片撑高；text-wrap 用于消除与 line-clamp 省略号的冲突
const descriptionClamp = "line-clamp-5 text-wrap";

const posts = computed(() => {
  return notices.value?.map((notice: any) => {
    return {
      title: notice.title,
      description: notice.content.slice(0, 100) + "...",
      date: notice.createdAt,
      to: `/notices/${notice.id}`,
      ui: { description: descriptionClamp },
    };
  });
});
</script>

<template>
  <UContainer>
    <UPageHeader title="公告列表" />
    <UPageBody>
      <UBlogPosts v-spotlight :posts />
    </UPageBody>
  </UContainer>
</template>
