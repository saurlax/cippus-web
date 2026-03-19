<script setup lang="ts">
const UButton = resolveComponent("UButton");

const { t } = useI18n();

const { data: papers, refresh } = await useFetch<any[]>("/api/admin/papers");

function formatDateText(value: unknown) {
  if (!value || typeof value !== "string") {
    return "";
  }

  return value.slice(0, 10);
}

const typeItems = paperTypeValues.map((value) => ({
  value,
  label: t(`papers.type.${value}`),
}));
const statusItems = reviewStatusValues.map((value) => ({
  value,
  label: t(`awards.status.${value}`),
}));

const columns = [
  { accessorKey: "id", header: "#" },
  { accessorKey: "user.username", header: "用户" },
  { accessorKey: "name", header: "名称" },
  { accessorKey: "type", header: "类型" },
  { accessorKey: "date", header: "时间" },
  { accessorKey: "status", header: "状态" },
  { accessorKey: "updatedAt", header: "更新时间" },
  { id: "actions", header: "操作" },
];

const openModal = ref(false);
const currentPaper = ref<any>({});

function openModalEditor(item?: any) {
  if (item) {
    currentPaper.value = {
      id: item.id,
      name: item.name,
      type: item.type,
      date: formatDateText(item.date),
      status: item.status,
      evidences: item.evidences || [],
    };
  } else {
    currentPaper.value = {};
  }
  openModal.value = true;
}

function closeModal() {
  openModal.value = false;
}

async function editPaper() {
  if (!currentPaper.value?.id) {
    return;
  }

  await $fetch(`/api/admin/papers/${currentPaper.value.id}`, {
    method: "put",
    body: {
      name: currentPaper.value.name,
      type: currentPaper.value.type,
      date: currentPaper.value.date,
      status: currentPaper.value.status,
    },
  });

  closeModal();
  await refresh();
}
</script>

<template>
  <UDashboardNavbar title="论文管理"></UDashboardNavbar>
  <UTable :data="papers" :columns>
    <template #type-cell="{ row }">
      {{ t(`papers.type.${row.original.type}`) }}
    </template>
    <template #date-cell="{ row }">
      {{ new Date(row.original.date).toLocaleString('zh-CN') }}
    </template>
    <template #status-cell="{ row }">
      {{ t(`awards.status.${row.original.status}`) }}
    </template>
    <template #updatedAt-cell="{ row }">
      {{ new Date(row.original.updatedAt).toLocaleString('zh-CN') }}
    </template>
    <template #actions-cell="{ row }">
      <UButton
        color="neutral"
        icon="i-lucide-edit"
        variant="ghost"
        size="sm"
        @click="openModalEditor(row.original)"
      />
    </template>
  </UTable>

  <UModal v-model:open="openModal" title="编辑论文">
    <template #body>
      <UForm class="flex flex-col gap-2" @submit.prevent="editPaper">
        <UFormField label="名称" name="name" required>
          <UInput v-model="currentPaper.name" class="w-full" />
        </UFormField>
        <UFormField label="类型" name="type" required>
          <USelect
            v-model="currentPaper.type"
            class="w-full"
            :items="typeItems as any"
          />
        </UFormField>
        <UFormField label="时间" name="date" required>
          <UInput v-model="currentPaper.date" class="w-full" type="date" />
        </UFormField>
        <UFormField label="状态" name="status" required>
          <USelect
            v-model="currentPaper.status"
            class="w-full"
            :items="statusItems as any"
          />
        </UFormField>
        <UFormField label="附件" name="evidences">
          <EvidencePreview :evidences="currentPaper.evidences || []" />
        </UFormField>
      </UForm>
    </template>
    <template #footer>
      <UButton @click="editPaper">保存</UButton>
    </template>
  </UModal>
</template>
