<script setup lang="ts">
const UButton = resolveComponent("UButton");
const toast = useToast();

const { data: awardTypes } = await useFetch<any>("/api/admin/award-types");
const confirmDeleteOpen = ref(false);
const deletingAwardType = ref<any>(null);

function openDeleteModal(item: any) {
  deletingAwardType.value = item;
  confirmDeleteOpen.value = true;
}

async function confirmDeleteAwardType() {
  const item = deletingAwardType.value;
  if (!item?.id) {
    return;
  }

  try {
    await $fetch(`/api/admin/award-types/${item.id}`, {
      method: "delete",
    });
    awardTypes.value = await $fetch("/api/admin/award-types");
    toast.add({ title: "删除成功", color: "success" });
    confirmDeleteOpen.value = false;
    deletingAwardType.value = null;
  } catch (error: any) {
    toast.add({
      title: error?.data?.message || error?.message || "删除失败",
      color: "error",
    });
  }
}

const columns = [
  { accessorKey: "id", header: "#" },
  { accessorKey: "name", header: "类型名称" },
  {
    id: "actions",
    cell: ({ row }: any) => {
      const item = row.original;

      return h("div", { class: "flex gap-2" }, [
        h(UButton, {
          icon: "i-lucide-pencil",
          color: "neutral",
          variant: "ghost",
          onClick: () => {
            currentAwardType.value = { id: item.id, name: item.name };
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
const currentAwardType = ref<any>({
  name: "",
});

function createAwardType() {
  currentAwardType.value = {
    name: "",
  };
  openModal.value = true;
}

async function updateAwardType() {
  const item = currentAwardType.value;
  if (!item?.name?.trim()) {
    toast.add({ title: "请输入奖项类型名称", color: "warning" });
    return;
  }

  try {
    if (item.id) {
      await $fetch(`/api/admin/award-types/${item.id}`, {
        method: "put",
        body: { name: item.name },
      });
    } else {
      await $fetch(`/api/admin/award-types`, {
        method: "post",
        body: { name: item.name },
      });
    }

    awardTypes.value = await $fetch("/api/admin/award-types");
    openModal.value = false;
    toast.add({ title: "保存成功", color: "success" });
  } catch (error: any) {
    toast.add({
      title: error?.data?.message || error?.message || "保存失败",
      color: "error",
    });
  }
}
</script>

<template>
  <UDashboardNavbar title="奖项类型管理">
    <template #right>
      <UButton @click="createAwardType">新建类型</UButton>
    </template>
  </UDashboardNavbar>

  <UTable :data="awardTypes" :columns />

  <UModal v-model:open="openModal" title="编辑奖项类型">
    <template #body>
      <UForm class="flex flex-col gap-2" @submit.prevent="updateAwardType">
        <UFormField label="类型名称" name="name" required>
          <UInput
            class="w-full"
            v-model="currentAwardType.name"
            placeholder="请输入奖项类型名称"
          />
        </UFormField>
      </UForm>
    </template>
    <template #footer>
      <UButton @click="updateAwardType">保存</UButton>
    </template>
  </UModal>

  <UModal v-model:open="confirmDeleteOpen" title="确认删除">
    <template #body>
      <p>确认删除类型「{{ deletingAwardType?.name || deletingAwardType?.id }}」吗？</p>
    </template>
    <template #footer>
      <div class="flex items-center gap-2">
        <UButton color="neutral" variant="ghost" @click="confirmDeleteOpen = false">
          取消
        </UButton>
        <UButton color="error" @click="confirmDeleteAwardType">确认删除</UButton>
      </div>
    </template>
  </UModal>
</template>
