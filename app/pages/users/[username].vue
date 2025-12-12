<script setup lang="ts">
const route = useRoute();
const { data: user } = await useFetch(`/api/users/${route.params.username}`);
if (!user.value) {
  throw createError({ statusCode: 404 });
}
</script>

<template>
  <UContainer v-if="user">
    <UPageHeader
      headline="用户"
      :title="user.name || user.username"
      :description="user.bio || '这个人很神秘，什么都没有留下。'"
    />

    <UPage>
      <UPageBody>
        <UPageCard title="获奖经历">
          <UEmpty title="No awards found" />
        </UPageCard>
      </UPageBody>
    </UPage>
  </UContainer>
</template>
