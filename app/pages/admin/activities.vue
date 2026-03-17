<script setup lang="ts">
const UButton = resolveComponent("UButton");

const { data: activities } = await useFetch("/api/admin/activities");

const columns = [
  { accessorKey: "id", header: "#" },
  { accessorKey: "name", header: "名称" },
  { accessorKey: "description", header: "描述" },
  { accessorKey: "startDate", header: "开始日期" },
  { accessorKey: "endDate", header: "结束日期" },
  {
    id: "actions",
    cell: ({ row }: any) => {
      const item = row.original;

      return h(UButton, {
        icon: "i-lucide-edit",
        color: "neutral",
        variant: "ghost",
        onClick: () => {
          currentActivity.value = item;
          openModal.value = true;
        },
      });
    },
  },
];
const openModal = ref(false);
const currentActivity = ref<any>({
  name: "",
  description: "",
  startDate: new Date(),
  endDate: new Date(),
});

function createActivity() {
  openModal.value = true;
  currentActivity.value = {
    name: "",
    description: "",
    startDate: new Date(),
    endDate: new Date(),
  };
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
  <UDashboardNavbar title="申报管理">
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
          <UInput
            class="w-full"
            type="date"
            v-model="currentActivity.startDate"
          />
        </UFormField>
        <UFormField label="结束日期" name="endDate" required>
          <UInput
            class="w-full"
            type="date"
            v-model="currentActivity.endDate"
          />
        </UFormField>
      </UForm>
    </template>
    <template #footer>
      <UButton @click="updateActivity">提交</UButton>
    </template>
  </UModal>
</template>
