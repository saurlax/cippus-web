<script setup lang="ts">
import type { Database } from "~/types/database.types";

type Notice = {
  id: number;
  title: string;
  content: string;
  category: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

const route = useRoute();
const supabase = useSupabaseClient<Database>();

const { data: notice } = await useAsyncData<Notice | null>(
  () => `notice-${route.params.id}`,
  async () => {
    const id = Number(route.params.id);
    const { data, error } = await supabase
      .from("notices")
      .select("id, title, content, category, created_at, updated_at")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message });
    }

    if (!data) {
      throw createError({ statusCode: 404, statusMessage: "公告不存在" });
    }

    return {
      id: data.id,
      title: data.title,
      content: data.content,
      category: data.category,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
);

const links = [
  {
    label: "返回列表",
    icon: "i-heroicons-arrow-left",
    to: "/notices",
  },
];
</script>

<template>
  <UContainer v-if="notice">
    <UPageHeader headline="公告" :title="notice.title" :links="links" />

    <UPage>
      <UPageBody>
        <MDC :value="notice.content" />
      </UPageBody>
    </UPage>
  </UContainer>
</template>
