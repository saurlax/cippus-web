<script setup lang="ts">
const UButton = resolveComponent("UButton");

const { t } = useI18n();

const { data: awards, refresh } = await useFetch<any[]>("/api/admin/awards");

function formatDateText(value: unknown) {
  if (!value || typeof value !== "string") {
    return "";
  }

  return value.slice(0, 10);
}

const levelItems = awardLevelValues.map((value) => ({
  value,
  label: t(`awards.level.${value}`),
}));
const typeItems = awardTypeValues.map((value) => ({
  value,
  label: t(`awards.type.${value}`),
}));
const statusItems = reviewStatusValues.map((value) => ({
  value,
  label: t(`awards.status.${value}`),
}));

const columns = [
  { accessorKey: "id", header: "#" },
  { accessorKey: "user.username", header: "用户" },
  { accessorKey: "contest.title", header: "比赛" },
  {
    accessorKey: "level",
    header: "级别",
    cell: ({ row }: any) => t(`awards.level.${row.original.level}`),
  },
  {
    accessorKey: "type",
    header: "类型",
    cell: ({ row }: any) => t(`awards.type.${row.original.type}`),
  },
  {
    accessorKey: "date",
    header: "获奖时间",
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
          currentAward.value = {
            id: item.id,
            status: item.status,
            level: item.level,
            type: item.type,
            date: formatDateText(item.date),
            evidences: item.evidences || [],
          };
          openModal.value = true;
        },
      });
    },
  },
];

const openModal = ref(false);
const currentAward = ref<any>({});

async function editAward() {
  if (!currentAward.value?.id) {
    return;
  }

  await $fetch(`/api/admin/awards/${currentAward.value.id}`, {
    method: "put",
    body: {
      status: currentAward.value.status,
      level: currentAward.value.level,
      type: currentAward.value.type,
      date: currentAward.value.date,
    },
  });

  openModal.value = false;
  await refresh();
}
</script>

<template>
  <UDashboardNavbar title="奖项管理"></UDashboardNavbar>
  <UTable :data="awards" :columns />

  <UModal v-model:open="openModal" title="编辑奖项">
    <template #body>
      <UForm class="flex flex-col gap-2" @submit.prevent="editAward">
        <UFormField label="级别" name="level" required>
          <USelect
            v-model="currentAward.level"
            class="w-full"
            :items="levelItems as any"
          />
        </UFormField>
        <UFormField label="类型" name="type" required>
          <USelect
            v-model="currentAward.type"
            class="w-full"
            :items="typeItems as any"
          />
        </UFormField>
        <UFormField label="获奖时间" name="date" required>
          <UInput v-model="currentAward.date" class="w-full" type="date" />
        </UFormField>
        <UFormField label="状态" name="status" required>
          <USelect
            v-model="currentAward.status"
            class="w-full"
            :items="statusItems as any"
          />
        </UFormField>
        <UFormField label="附件" name="evidences">
          <EvidencePreview :evidences="currentAward.evidences || []" />
        </UFormField>
      </UForm>
    </template>
    <template #footer>
      <UButton @click="editAward">保存</UButton>
    </template>
  </UModal>
</template>
