<script setup lang="ts">
import dayjs from "dayjs";

const { data: activities } = await useFetch("/api/activities");

const posts = computed(() => {
  return activities.value?.map((activity) => {
    return {
      title: `活动 #${activity.id}`,
      description: "",
      date: String(activity.id),
    };
  });
});
</script>

<template>
  <UContainer>
    <UPageHeader title="活动列表" />
    <UBlogPosts :posts />
  </UContainer>
</template>
