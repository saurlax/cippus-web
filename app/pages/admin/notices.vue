<script setup lang="ts">
const UButton = resolveComponent("UButton");
const toast = useToast();

const { data: notices, refresh: refreshNotices } = await useFetch(
  "/api/admin/notices"
);
const confirmDeleteOpen = ref(false);
const deletingNotice = ref<any>(null);

function openDeleteModal(item: any) {
  deletingNotice.value = item;
  confirmDeleteOpen.value = true;
}

async function confirmDeleteNotice() {
  const item = deletingNotice.value;
  if (!item?.id) {
    return;
  }

  try {
    await $fetch(`/api/admin/notices/${item.id}`, {
      method: "delete",
    });
    await refreshNotices();
    toast.add({ title: "删除成功", color: "success" });
    confirmDeleteOpen.value = false;
    deletingNotice.value = null;
  } catch (error: any) {
    toast.add({
      title: error?.data?.message || error?.message || "删除失败",
      description: error?.data?.message || error?.message,
      color: "error",
    });
  }
}

const columns = [
  { accessorKey: "id", header: "#" },
  { accessorKey: "title", header: "标题" },
  { accessorKey: "category", header: "分类" },
  { accessorKey: "createdAt", header: "创建时间" },
  { accessorKey: "updatedAt", header: "更新时间" },
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
            currentNotice.value = item;
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
const currentNotice = ref<any>({
  title: "",
  category: "",
  content: "",
});

function createNotice() {
  openModal.value = true;
  currentNotice.value = {
    title: "",
    category: "",
    content: "",
  };
}

async function updateNotice() {
  const notice = currentNotice.value;
  if (notice) {
    if (notice.id) {
      await $fetch<any>(`/api/admin/notices/${notice.id}`, {
        method: "PUT",
        body: notice,
      });
    } else {
      await $fetch<any>(`/api/admin/notices`, {
        method: "POST",
        body: notice,
      });
    }
  }
  await refreshNotices();
  openModal.value = false;
}
</script>

<template>
  <UDashboardNavbar title="公告管理">
    <template #right>
      <UButton @click="createNotice">新建公告</UButton>
    </template>
  </UDashboardNavbar>
  <UTable :data="notices" :columns />
  <UModal v-model:open="openModal" title="编辑公告">
    <template #body>
      <UForm class="flex flex-col gap-2" @submit="updateNotice">
        <UFormField label="标题" name="title" required>
          <UInput
            class="w-full"
            v-model="currentNotice.title"
            placeholder="请输入公告标题"
          />
        </UFormField>
        <UFormField label="分类" name="category">
          <UInput
            class="w-full"
            v-model="currentNotice.category"
            placeholder="请输入公告分类"
          />
        </UFormField>
        <UFormField label="内容" name="content" required>
          <UTextarea
            class="w-full"
            v-model="currentNotice.content"
            placeholder="请输入公告内容"
          />
        </UFormField>
      </UForm>
    </template>
    <template #footer>
      <UButton @click="updateNotice">提交</UButton>
    </template>
  </UModal>

  <UModal v-model:open="confirmDeleteOpen" title="确认删除">
    <template #body>
      <p>确认删除公告「{{ deletingNotice?.title || deletingNotice?.id }}」吗？</p>
    </template>
    <template #footer>
      <div class="flex items-center gap-2">
        <UButton color="neutral" variant="ghost" @click="confirmDeleteOpen = false">
          取消
        </UButton>
        <UButton color="error" @click="confirmDeleteNotice">确认删除</UButton>
      </div>
    </template>
  </UModal>
</template>
