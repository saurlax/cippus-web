<script setup lang="ts">
const UButton = resolveComponent("UButton");
const toast = useToast();

const { data: activities } = await useFetch("/api/admin/activities");
const confirmDeleteOpen = ref(false);
const deletingActivity = ref<any>(null);

function openDeleteModal(item: any) {
  deletingActivity.value = item;
  confirmDeleteOpen.value = true;
}

async function confirmDeleteActivity() {
  const item = deletingActivity.value;
  if (!item?.id) {
    return;
  }

  try {
    await $fetch(`/api/admin/activities/${item.id}`, {
      method: "delete",
    });
    activities.value = await $fetch<any>("/api/admin/activities");
    toast.add({ title: "删除成功", color: "success" });
    confirmDeleteOpen.value = false;
    deletingActivity.value = null;
  } catch (error: any) {
    toast.add({
      title: error?.data?.message || error?.message || "删除失败",
      color: "error",
    });
  }
}

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

      return h("div", { class: "flex items-center gap-1" }, [
        h(UButton, {
          icon: "i-lucide-pencil",
          color: "neutral",
          variant: "ghost",
          onClick: () => {
            currentActivity.value = item;
            openModal.value = true;
          },
        }),
        h(UButton, {
          icon: "i-lucide-trash",
          color: "error",
          variant: "ghost",
          onClick: () => openDeleteModal(item),
        }),
      ]);
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

  <UModal v-model:open="confirmDeleteOpen" title="确认删除">
    <template #body>
      <p>确认删除申报活动「{{ deletingActivity?.name || deletingActivity?.id }}」吗？</p>
    </template>
    <template #footer>
      <div class="flex items-center gap-2">
        <UButton color="neutral" variant="ghost" @click="confirmDeleteOpen = false">
          取消
        </UButton>
        <UButton color="error" @click="confirmDeleteActivity">确认删除</UButton>
      </div>
    </template>
  </UModal>
</template>
