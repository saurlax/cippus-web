<script setup lang="ts">
const { data: activities } = await useFetch("/api/activities");

const posts = computed(() => {
  return activities.value?.map((activity: any) => {
    return {
      title: activity.name,
      description: activity.description || "",
      date: activity.startDate,
      to: `/activities/${activity.id}`,
    };
  });
});
</script>

<template>
  <UContainer>
    <UPageHeader title="申报列表" />
    <UPageBody>
      <UBlogPosts :posts />
    </UPageBody>
  </UContainer>
</template>
