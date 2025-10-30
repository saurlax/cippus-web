<script setup lang="ts">
import dayjs from "dayjs";

const { data: notices } = await useFetch("/api/notices");

const posts = computed(() => {
  return notices.value?.map((notice) => {
    return {
      title: notice.title,
      description: notice.content,
      date: notice.createdAt,
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
