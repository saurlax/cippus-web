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
      :title="`活动 #${activity.id}`" 
      :links="links"
    />
    
    <UPage v-if="activity">
      <UPageBody prose>
        <UAlert color="neutral" variant="soft" title="活动详情" />
      </UPageBody>
    </UPage>
    
    <UAlert v-else color="error" variant="soft" title="活动不存在" />
  </UContainer>
</template>
