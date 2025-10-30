<script setup lang="ts">
import dayjs from "dayjs";

const { data: contests } = await useFetch("/api/contests");

const posts = computed(() => {
  return contests.value?.map((contest) => {
    return {
      title: contest.title,
      description: contest.description || "",
      date: contest.createdAt,
    };
  });
});
</script>

<template>
  <UContainer>
    <UPageHeader title="赛事列表" />
    <UBlogPosts :posts />
  </UContainer>
</template>