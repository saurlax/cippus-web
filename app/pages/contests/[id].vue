<script setup lang="ts">
import type { Database } from "~/types/database.types";

type Contest = {
  id: number;
  title: string;
  description: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

const route = useRoute();
const supabase = useSupabaseClient<Database>();

const { data: contest } = await useAsyncData<Contest | null>(
  () => `contest-${route.params.id}`,
  async () => {
    const id = Number(route.params.id);
    const { data, error } = await supabase
      .from("contests")
      .select("id, title, description, created_at, updated_at")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message });
    }

    if (!data) {
      throw createError({ statusCode: 404, statusMessage: "赛事不存在" });
    }

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
);

const links = [
  {
    label: "返回列表",
    icon: "i-heroicons-arrow-left",
    to: "/contests",
  },
];
</script>

<template>
  <UContainer v-if="contest">
    <UPageHeader
      headline="赛事"
      :title="contest.title"
      :description="contest.description || ''"
      :links="links"
    />
  </UContainer>
</template>
