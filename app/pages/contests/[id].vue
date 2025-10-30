<script setup lang="ts">
const route = useRoute()
const { data: contest } = await useFetch<any>(`/api/contests/${route.params.id}`)

const links = [{
  label: '返回列表',
  icon: 'i-heroicons-arrow-left',
  to: '/contests'
}]
</script>

<template>
  <UContainer>
    <UPageHeader 
      v-if="contest"
      :title="contest.title" 
      :links="links"
    />
    
    <UPage v-if="contest">
      <UPageBody prose>
        <div v-if="contest.description" v-html="contest.description" />
        <UAlert v-else color="neutral" variant="soft" title="暂无内容" />
      </UPageBody>
    </UPage>
    
    <UAlert v-else color="error" variant="soft" title="赛事不存在" />
  </UContainer>
</template>
