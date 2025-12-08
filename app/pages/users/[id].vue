<script setup lang="ts">
const route = useRoute();
const { data: user } = await useFetch(`/api/users/${route.params.id}`);
if (!user.value) {
  throw createError({ statusCode: 404 });
}
</script>

<template>
  <UContainer v-if="user">
    <UPageHeader headline="用户" :title="user.name" />

    <UPage>
      <UPageBody prose>
        <MDC :value="user.content" />
      </UPageBody>
    </UPage>
  </UContainer>
</template>
