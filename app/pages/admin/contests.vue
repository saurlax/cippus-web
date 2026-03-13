<script setup lang="ts">
const UButton = resolveComponent("UButton");
const toast = useToast();

const { data: contests, refresh } = await useFetch("/api/admin/contests");
const confirmDeleteOpen = ref(false);
const deletingContest = ref<any>(null);

function openDeleteModal(item: any) {
  deletingContest.value = item;
  confirmDeleteOpen.value = true;
}

async function confirmDeleteContest() {
  const item = deletingContest.value;
  if (!item?.id) {
    return;
  }

  try {
    await $fetch(`/api/admin/contests/${item.id}`, {
      method: "delete",
    });
    refresh();
    toast.add({ title: "删除成功", color: "success" });
    confirmDeleteOpen.value = false;
    deletingContest.value = null;
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
  { accessorKey: "description", header: "描述" },
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
            currentContest.value = item;
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
const currentContest = ref<any>({
  title: "",
  description: "",
});

function createContest() {
  openModal.value = true;
  currentContest.value = {
    title: "",
    description: "",
  };
}

async function updateContest() {
  const contest = currentContest.value;
  if (contest) {
    if (contest.id) {
      await $fetch<any>(`/api/admin/contests/${contest.id}`, {
        method: "PUT",
        body: contest,
      });
    } else {
      await $fetch<any>(`/api/admin/contests`, {
        method: "POST",
        body: contest,
      });
    }
  }
  refresh();
  openModal.value = false;
}
</script>

<template>
  <UDashboardNavbar title="赛事管理">
    <template #right>
      <UButton @click="createContest">新建赛事</UButton>
    </template>
  </UDashboardNavbar>
  <UTable :data="contests" :columns />
  <UModal v-model:open="openModal" title="编辑赛事">
    <template #body>
      <UForm class="flex flex-col gap-2" @submit="updateContest">
        <UFormField label="标题" name="title" required>
          <UInput
            class="w-full"
            v-model="currentContest.title"
            placeholder="请输入赛事标题"
          />
        </UFormField>
        <UFormField label="描述" name="description">
          <UTextarea
            class="w-full"
            v-model="currentContest.description"
            placeholder="请输入赛事描述"
          />
        </UFormField>
      </UForm>
    </template>
    <template #footer>
      <UButton @click="updateContest">提交</UButton>
    </template>
  </UModal>

  <UModal v-model:open="confirmDeleteOpen" title="确认删除">
    <template #body>
      <p>
        确认删除赛事「{{ deletingContest?.title || deletingContest?.id }}」吗？
      </p>
    </template>
    <template #footer>
      <div class="flex items-center gap-2">
        <UButton
          color="neutral"
          variant="ghost"
          @click="confirmDeleteOpen = false"
        >
          取消
        </UButton>
        <UButton color="error" @click="confirmDeleteContest">确认删除</UButton>
      </div>
    </template>
  </UModal>
</template>
