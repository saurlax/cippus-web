<script setup lang="ts">
const route = useRoute();
const { data: notice } = await useFetch(`/api/notices/${route.params.id}`);
if (!notice.value) {
  throw createError({ statusCode: 404 });
}

const links = [
  {
    label: "返回列表",
    icon: "i-heroicons-arrow-left",
    to: "/notices",
  },
];
</script>

<template>
  <UContainer v-if="notice">
    <UPageHeader headline="公告" :title="notice.title" :links="links" />

    <UPage>
      <UPageBody prose>
        <MDC :value="notice.content" />
      </UPageBody>
    </UPage>
  </UContainer>
</template>
