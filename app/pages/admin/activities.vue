<script setup lang="ts">
import type { Activity } from "@prisma/client";
const UDropdownMenu = resolveComponent("UDropdownMenu");
const UButton = resolveComponent("UButton");

definePageMeta({
  layout: "admin",
});

const { data: activities } = await useFetch("/api/admin/activities");
const columns = [
  { accessorKey: "id", header: "#" },
  {
    id: "actions",
    cell: ({ row }: any) => {
      return h(
        UDropdownMenu,
        {
          items: [
            {
              label: "编辑活动",
              onClick: () => {
                currentActivity.value = row.original;
                openModal.value = true;
              },
            },
          ],
        },
        () => {
          return h(UButton, {
            icon: "i-lucide-ellipsis-vertical",
            color: "neutral",
            variant: "ghost",
          });
        }
      );
    },
  },
];
const openModal = ref(false);
const currentActivity = ref<Partial<Activity>>({});

function createActivity() {
  openModal.value = true;
  currentActivity.value = {};
}

async function updateActivity() {
  const activity = currentActivity.value;
  if (activity) {
    if (activity.id) {
      await $fetch<any>(`/api/admin/activities/${activity.id}`, {
        method: "PUT",
        body: activity,
      });
    } else {
      await $fetch<any>(`/api/admin/activities`, {
        method: "POST",
        body: activity,
      });
    }
  }
  activities.value = await $fetch<any>("/api/admin/activities");
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
      </UForm>
    </template>
    <template #footer>
      <UButton @click="updateActivity">提交</UButton>
    </template>
  </UModal>
</template>
