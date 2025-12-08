<script setup lang="ts">
const route = useRoute();
const { data: contest } = await useFetch(`/api/contests/${route.params.id}`);

const links = [
  {
    label: "返回列表",
    icon: "i-heroicons-arrow-left",
    to: "/contests",
  },
];
</script>

<template>
  <UContainer v-if="contest">
    <UPageHeader
      headline="赛事"
      :title="contest.title"
      :description="contest.description || ''"
      :links="links"
    />
  </UContainer>
</template>
