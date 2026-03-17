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
  {
    accessorKey: "type",
    header: "类型",
    cell: ({ row }: any) => t(`papers.type.${row.original.type}`),
  },
  {
    accessorKey: "date",
    header: "时间",
    cell: ({ row }: any) => formatDateText(row.original.date),
  },
  {
    accessorKey: "status",
    header: "状态",
    cell: ({ row }: any) => t(`awards.status.${row.original.status}`),
  },
  {
    accessorKey: "updatedAt",
    header: "更新时间",
    cell: ({ row }: any) => formatDateText(row.original.updatedAt),
  },
  {
    id: "actions",
    cell: ({ row }: any) => {
      const item = row.original;

      return h(UButton, {
        color: "neutral",
        icon: "i-lucide-edit",
        variant: "ghost",
        onClick: () => {
          currentPaper.value = {
            id: item.id,
            name: item.name,
            type: item.type,
            date: formatDateText(item.date),
            status: item.status,
            evidences: item.evidences || [],
          };
          openModal.value = true;
        },
      });
    },
  },
];

const openModal = ref(false);
const currentPaper = ref<any>({});

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

  openModal.value = false;
  await refresh();
}
</script>

<template>
  <UDashboardNavbar title="论文管理"></UDashboardNavbar>
  <UTable :data="papers" :columns />

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
