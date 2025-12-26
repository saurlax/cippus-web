<script setup lang="ts">
import type { Database } from "~/types/database.types";

type UserProfile = {
  id: string;
  username: string | null;
  name: string | null;
  bio: string | null;
  gender: string | null;
  college: string | null;
};

const route = useRoute();
const supabase = useSupabaseClient<Database>();
const identifier = route.params.username as string;

const { data: user } = await useAsyncData<UserProfile | null>(
  () => `user-${identifier}`,
  async () => {
    const { data, error } = await supabase
      .from("users")
      .select("id, username, name, bio, gender, college")
      .eq("username", identifier)
      .maybeSingle();

    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message });
    }

    if (!data) {
      throw createError({ statusCode: 404, statusMessage: "用户不存在" });
    }

    return data;
  }
);
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
