<script setup lang="ts">
import type { Database } from "~/types/database.types";

type Contest = {
  id: number;
  title: string;
  description: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

const supabase = useSupabaseClient<Database>();

const { data: contests } = await useAsyncData<Contest[]>(
  "contests-list",
  async () => {
    const { data, error } = await supabase
      .from("contests")
      .select("id, title, description, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message });
    }

    return (data ?? []).map((contest) => ({
      id: contest.id,
      title: contest.title,
      description: contest.description,
      createdAt: contest.created_at,
      updatedAt: contest.updated_at,
    }));
  }
);

const posts = computed(() =>
  contests.value?.map((contest) => ({
    title: contest.title,
    description: contest.description || "",
    date: contest.createdAt,
    to: `/contests/${contest.id}`,
  }))
);
</script>

<template>
  <UContainer>
    <UPageHeader title="赛事列表" />
    <UBlogPosts :posts />
  </UContainer>
</template>
