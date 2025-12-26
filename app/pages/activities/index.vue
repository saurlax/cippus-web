<script setup lang="ts">
import type { Database } from "~/types/database.types";

type Activity = {
  id: number;
  name: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
};

const supabase = useSupabaseClient<Database>();

const { data: activities } = await useAsyncData<Activity[]>(
  "activities-list",
  async () => {
    const { data, error } = await supabase
      .from("activities")
      .select("id, name, description, start_date, end_date")
      .order("start_date", { ascending: false });

    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message });
    }

    return (data ?? []).map((activity) => ({
      id: activity.id,
      name: activity.name,
      description: activity.description,
      startDate: activity.start_date,
      endDate: activity.end_date,
    }));
  }
);

const posts = computed(() =>
  activities.value?.map((activity) => ({
    title: activity.name,
    description: activity.description || "",
    date: activity.startDate,
    to: `/activities/${activity.id}`,
  }))
);
</script>

<template>
  <UContainer>
    <UPageHeader title="申报列表" />
    <UBlogPosts :posts />
  </UContainer>
</template>
