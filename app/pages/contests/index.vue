<script setup lang="ts">
const { data: contests } = await useFetch("/api/contests");

const posts = computed(() => {
  return contests.value?.map((contest) => {
    return {
      title: contest.title,
      description: contest.description || "",
      date: contest.createdAt,
      to: `/contests/${contest.id}`,
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
