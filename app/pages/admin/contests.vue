<script setup lang="ts">
const UButton = resolveComponent("UButton");

const { data: contests, refresh } = await useFetch("/api/admin/contests");

const columns = [
  { accessorKey: "id", header: "#" },
  { accessorKey: "title", header: "标题" },
  { accessorKey: "description", header: "描述" },
  { accessorKey: "createdAt", header: "创建时间" },
  { accessorKey: "updatedAt", header: "更新时间" },
  { id: "actions", header: "操作" },
];
const openModal = ref(false);
const currentContest = ref<any>({
  title: "",
  description: "",
});

function openModalEditor(item?: any) {
  if (item) {
    currentContest.value = item;
  } else {
    currentContest.value = {
      title: "",
      description: "",
    };
  }
  openModal.value = true;
}

function closeModal() {
  openModal.value = false;
}

function createContest() {
  openModalEditor();
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
  closeModal();
}
</script>

<template>
  <UDashboardNavbar title="竞赛管理">
    <template #right>
      <UButton @click="createContest">新建竞赛</UButton>
    </template>
  </UDashboardNavbar>
  <UTable :data="contests" :columns>
    <template #createdAt-cell="{ row }">
      {{ new Date(row.original.createdAt).toLocaleString('zh-CN') }}
    </template>
    <template #updatedAt-cell="{ row }">
      {{ new Date(row.original.updatedAt).toLocaleString('zh-CN') }}
    </template>
    <template #actions-cell="{ row }">
      <UButton
        icon="i-lucide-edit"
        color="neutral"
        variant="ghost"
        size="sm"
        @click="openModalEditor(row.original)"
      />
    </template>
  </UTable>
  <UModal v-model:open="openModal" title="编辑竞赛">
    <template #body>
      <UForm class="flex flex-col gap-2" @submit="updateContest">
        <UFormField label="标题" name="title" required>
          <UInput
            class="w-full"
            v-model="currentContest.title"
            placeholder="请输入竞赛标题"
          />
        </UFormField>
        <UFormField label="描述" name="description">
          <UTextarea
            class="w-full"
            v-model="currentContest.description"
            placeholder="请输入竞赛描述"
          />
        </UFormField>
      </UForm>
    </template>
    <template #footer>
      <UButton @click="updateContest">提交</UButton>
    </template>
  </UModal>
</template>
