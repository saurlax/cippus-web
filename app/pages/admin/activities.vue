<script setup lang="ts">
import type { Database } from "~/types/database.types";

const UDropdownMenu = resolveComponent("UDropdownMenu");
const UButton = resolveComponent("UButton");

definePageMeta({
  layout: "admin",
});

type Activity = {
  id?: number;
  name: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
};

const supabase = useSupabaseClient<Database>();
const toast = useToast();

const today = () => new Date().toISOString().slice(0, 10);
const emptyActivity = (): Activity => ({
  name: "",
  description: "",
  startDate: today(),
  endDate: today(),
});

const { data: activities, refresh: refreshActivities } =
  await useAsyncData<Activity[]>("admin-activities", async () => {
    const { data, error } = await supabase
      .from("activities")
      .select("id, name, description, start_date, end_date")
      .order("id", { ascending: false });

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
  });

const columns = [
  { accessorKey: "id", header: "#" },
  { accessorKey: "name", header: "名称" },
  { accessorKey: "description", header: "描述" },
  { accessorKey: "startDate", header: "开始日期" },
  { accessorKey: "endDate", header: "结束日期" },
  {
    id: "actions",
    cell: ({ row }: any) =>
      h(
        UDropdownMenu,
        {
          items: [
            {
              label: "编辑活动",
              onClick: () => {
                currentActivity.value = { ...row.original };
                openModal.value = true;
              },
            },
          ],
        },
        () =>
          h(UButton, {
            icon: "i-lucide-ellipsis-vertical",
            color: "neutral",
            variant: "ghost",
          })
      ),
  },
];

const openModal = ref(false);
const currentActivity = ref<Activity>(emptyActivity());

function createActivity() {
  currentActivity.value = emptyActivity();
  openModal.value = true;
}

async function updateActivity() {
  const activity = currentActivity.value;
  if (!activity) return;

  const payload = {
    name: activity.name,
    description: activity.description,
    start_date: activity.startDate,
    end_date: activity.endDate,
  } satisfies Database["public"]["Tables"]["activities"]["Insert"];

  const { error } = activity.id
    ? await supabase
        .from("activities")
        .update(payload)
        .eq("id", activity.id)
    : await supabase.from("activities").insert([payload]);

  if (error) {
    toast.add({ title: error.message, color: "error" });
    return;
  }

  await refreshActivities();
  openModal.value = false;
}
</script>

<template>
  <UDashboardNavbar title="活动管理">
    <template #right>
      <UButton @click="createActivity">新建活动</UButton>
    </template>
  </UDashboardNavbar>
  <UTable :data="activities" :columns />
  <UModal v-model:open="openModal" title="编辑活动">
    <template #body>
      <UForm class="flex flex-col gap-2" @submit="updateActivity">
        <UFormField label="名称" name="name" required>
          <UInput
            class="w-full"
            v-model="currentActivity.name"
            placeholder="请输入活动名称"
          />
        </UFormField>
        <UFormField label="描述" name="description">
          <UTextarea
            class="w-full"
            v-model="currentActivity.description"
            placeholder="请输入活动描述"
          />
        </UFormField>
        <UFormField label="开始日期" name="startDate" required>
          <UInput class="w-full" type="date" v-model="currentActivity.startDate" />
        </UFormField>
        <UFormField label="结束日期" name="endDate" required>
          <UInput class="w-full" type="date" v-model="currentActivity.endDate" />
        </UFormField>
      </UForm>
    </template>
    <template #footer>
      <UButton @click="updateActivity">提交</UButton>
    </template>
  </UModal>
</template>
