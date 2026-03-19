<script setup lang="ts">
const { data: contests } = await useFetch("/api/contests");

const posts = computed(() => {
  return contests.value?.map((contest: any) => {
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
    <UPageHeader title="竞赛列表" />
    <UPageBody>
      <UBlogPosts :posts />
    </UPageBody>
  </UContainer>
</template>
