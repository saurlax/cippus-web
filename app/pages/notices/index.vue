<script setup lang="ts">
const { data: notices } = await useFetch("/api/notices");

const posts = computed(() => {
  return notices.value?.map((notice) => {
    return {
      title: notice.title,
      description: notice.content.slice(0, 100) + "...",
      date: notice.createdAt,
      to: `/notices/${notice.id}`,
    };
  });
});
</script>

<template>
  <UContainer>
    <UPageHeader title="公告列表" />
    <UBlogPosts :posts />
  </UContainer>
</template>
