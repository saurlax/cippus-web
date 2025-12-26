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

const supabase = useSupabaseClient<Database>();

const { data: notices } = await useAsyncData<Notice[]>(
  "notices-list",
  async () => {
    const { data, error } = await supabase
      .from("notices")
      .select("id, title, content, category, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message });
    }

    return (data ?? []).map((notice) => ({
      id: notice.id,
      title: notice.title,
      content: notice.content,
      category: notice.category,
      createdAt: notice.created_at,
      updatedAt: notice.updated_at,
    }));
  }
);

const posts = computed(() =>
  notices.value?.map((notice) => ({
    title: notice.title,
    description: (notice.content || "").slice(0, 100) + "...",
    date: notice.createdAt,
    to: `/notices/${notice.id}`,
  }))
);
</script>

<template>
  <UContainer>
    <UPageHeader title="公告列表" />
    <UBlogPosts :posts />
  </UContainer>
</template>
