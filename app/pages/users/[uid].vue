<script setup lang="ts">
const route = useRoute();
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const uid = route.params.uid as string;

const { data: profile } = useAsyncData(async () => {
  return supabase
    .from("profiles")
    .select("*")
    .eq("id", uid)
    .single()
    .then(({ data }) => data);
});

const form = reactive({
  bio: profile.value?.bio || "",
});

const updateProfile = async () => {
  await supabase.from("profiles").update({ bio: form.bio }).eq("id", uid);
};
</script>

<template>
  <UContainer v-if="profile">
    <UPageHeader
      headline="用户"
      :title="profile.name || profile.id_number || '未知用户'"
      :description="profile.bio || '这个人很神秘，什么都没有留下。'"
    >
      <template #links v-if="user?.sub === uid">
        <UModal title="编辑资料">
          <UButton icon="lucide-edit" variant="outline">编辑资料</UButton>
          <template #body>
            <UForm>
              <UFormField label="简介">
                <UTextarea v-model="form.bio" />
              </UFormField>
            </UForm>
          </template>
          <template #footer>
            <UButton @click="updateProfile">保存</UButton>
          </template>
        </UModal>
      </template>
    </UPageHeader>

    <UPage>
      <UPageBody>
        <UPageCard title="获奖经历">
          <UEmpty title="No awards found" />
        </UPageCard>
      </UPageBody>
    </UPage>
  </UContainer>
</template>
