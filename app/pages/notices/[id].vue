<script setup lang="ts">
const route = useRoute()
const { data: notice } = await useFetch<any>(`/api/notices/${route.params.id}`)

const links = [{
  label: '返回列表',
  icon: 'i-heroicons-arrow-left',
  to: '/notices'
}]
</script>

<template>
  <UContainer>
    <UPageHeader 
      v-if="notice"
      :title="notice.title" 
      :links="links"
    >
      <template #description v-if="notice.category">
        <UBadge color="primary" variant="soft">
          {{ notice.category }}
        </UBadge>
      </template>
    </UPageHeader>
    
    <UPage v-if="notice">
      <UPageBody prose>
        <div v-if="notice.content" v-html="notice.content" />
        <UAlert v-else color="neutral" variant="soft" title="暂无内容" />
      </UPageBody>
    </UPage>
    
    <UAlert v-else color="error" variant="soft" title="公告不存在" />
  </UContainer>
</template>
