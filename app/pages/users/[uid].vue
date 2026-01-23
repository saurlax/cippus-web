<script setup lang="ts">
const route = useRoute();
const supabase = useSupabaseClient();
const uid = route.params.uid as string;

const { data: user } = useAsyncData(async () => {
  return supabase
    .from("profiles")
    .select("*")
    .eq("id", uid)
    .single()
    .then(({ data }) => data);
});
</script>

<template>
  <UContainer v-if="user">
    <UPageHeader
      headline="用户"
      :title="user.name || user.id_number || '未知用户'"
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
