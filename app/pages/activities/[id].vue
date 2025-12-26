<script setup lang="ts">
import type { Database } from "~/types/database.types";

type Activity = {
  id: number;
  name: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
};

const route = useRoute();
const supabase = useSupabaseClient<Database>();

const { data: activity } = await useAsyncData<Activity | null>(
  () => `activity-${route.params.id}`,
  async () => {
    const id = Number(route.params.id);
    const { data, error } = await supabase
      .from("activities")
      .select("id, name, description, start_date, end_date")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message });
    }

    if (!data) {
      throw createError({ statusCode: 404, statusMessage: "活动不存在" });
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      startDate: data.start_date,
      endDate: data.end_date,
    };
  }
);

const links = [
  {
    label: "返回列表",
    icon: "i-heroicons-arrow-left",
    to: "/activities",
  },
];
</script>

<template>
  <UContainer v-if="activity">
    <UPageHeader headline="申报" :title="activity.name" :links="links" />
  </UContainer>
</template>
