<script setup lang="ts">
const route = useRoute()
const { data: activity } = await useFetch<any>(`/api/activities/${route.params.id}`)

const links = [{
  label: '返回列表',
  icon: 'i-heroicons-arrow-left',
  to: '/activities'
}]
</script>

<template>
  <UContainer>
    <UPageHeader 
      v-if="activity"
      :title="activity.name" 
      :links="links"
    >
      <template #description v-if="activity.startDate || activity.endDate">
        <div class="flex gap-2 text-sm text-gray-500">
          <span v-if="activity.startDate">开始: {{ new Date(activity.startDate).toLocaleDateString() }}</span>
          <span v-if="activity.endDate">结束: {{ new Date(activity.endDate).toLocaleDateString() }}</span>
        </div>
      </template>
    </UPageHeader>
    
    <UPage v-if="activity">
      <UPageBody prose>
        <div v-if="activity.description" v-html="activity.description" />
        <UAlert v-else color="neutral" variant="soft" title="暂无内容" />
      </UPageBody>
    </UPage>
    
    <UAlert v-else color="error" variant="soft" title="活动不存在" />
  </UContainer>
</template>
