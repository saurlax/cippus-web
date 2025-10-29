<script setup lang="ts">
import dayjs from 'dayjs'

const { data: notices } = await useFetch("/api/notices");

const items = computed(
  () =>
    notices.value?.map((notice) => ({
      id: notice.id,
      label: notice.title,
      description: notice.category,
      to: `/notices/${notice.id}`,
      badge: notice.category
        ? {
            label: notice.category,
            color: "primary" as const,
          }
        : undefined,
      meta: dayjs(notice.createdAt).format('YYYY-MM-DD'),
    })) || []
);
</script>

<template>
  <UContainer>
    <UPageHeader title="公告列表" />
    <UPageList :items="items" />
  </UContainer>
</template>
