<script setup lang="ts">
const route = useRoute();
const { data: activity } = await useFetch<any>(
  `/api/activities/${route.params.id}`
);

const links = [
  {
    label: "返回列表",
    icon: "i-heroicons-arrow-left",
    to: "/activities",
  },
];
</script>

<template>
  <UContainer v-if="activity">
    <UPageHeader headline="申报" :title="activity.name" :links="links" />
  </UContainer>
</template>
