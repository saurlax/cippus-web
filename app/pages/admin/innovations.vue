<script setup lang="ts">
const UButton = resolveComponent("UButton");

const { t } = useI18n();

const { data: innovations, refresh } = await useFetch<any[]>(
  "/api/admin/innovations",
);

function formatDateText(value: unknown) {
  if (!value || typeof value !== "string") {
    return "";
  }

  return value.slice(0, 10);
}

function formatMembersText(members: unknown) {
  if (!Array.isArray(members)) {
    return "";
  }

  return members
    .map((item) => String(item || "").trim())
    .filter((item) => item.length > 0)
    .join(",");
}

function normalizeMembersList(value: string[] | undefined) {
  return Array.from(
    new Set(
      (value || [])
        .map((item) => item.trim())
        .filter((item) => item.length > 0),
    ),
  );
}

const typeItems = innovationTypeValues.map((value) => ({
  value,
  label: t(`innovations.type.${value}`),
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
  { accessorKey: "members", header: "成员排序" },
  { accessorKey: "date", header: "时间" },
  { accessorKey: "status", header: "状态" },
  { accessorKey: "updatedAt", header: "更新时间" },
  { id: "actions", header: "操作" },
];

const openModal = ref(false);
const currentInnovation = ref<any>({});
const membersTags = ref<string[]>([]);

function openModalEditor(item?: any) {
  if (item) {
    currentInnovation.value = {
      id: item.id,
      name: item.name,
      type: item.type,
      date: formatDateText(item.date),
      members: item.members || [],
      status: item.status,
      evidences: item.evidences || [],
    };
    membersTags.value = normalizeMembersList(item.members as string[]);
  } else {
    currentInnovation.value = {};
    membersTags.value = [];
  }
  openModal.value = true;
}

function closeModal() {
  openModal.value = false;
}

async function editInnovation() {
  if (!currentInnovation.value?.id) {
    return;
  }

  await $fetch(`/api/admin/innovations/${currentInnovation.value.id}`, {
    method: "put",
    body: {
      name: currentInnovation.value.name,
      type: currentInnovation.value.type,
      date: currentInnovation.value.date,
      members: normalizeMembersList(membersTags.value),
      status: currentInnovation.value.status,
    },
  });

  closeModal();
  await refresh();
}
</script>

<template>
  <UDashboardNavbar title="大创管理"></UDashboardNavbar>
  <UTable :data="innovations" :columns>
    <template #type-cell="{ row }">
      {{ t(`innovations.type.${row.original.type}`) }}
    </template>
    <template #members-cell="{ row }">
      {{ formatMembersText(row.original.members) || "-" }}
    </template>
    <template #date-cell="{ row }">
      {{ new Date(row.original.date).toLocaleString() }}
    </template>
    <template #status-cell="{ row }">
      {{ t(`awards.status.${row.original.status}`) }}
    </template>
    <template #updatedAt-cell="{ row }">
      {{ new Date(row.original.updatedAt).toLocaleString() }}
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

  <UModal v-model:open="openModal" title="编辑大创">
    <template #body>
      <UForm class="flex flex-col gap-2" @submit.prevent="editInnovation">
        <UFormField label="名称" name="name" required>
          <UInput v-model="currentInnovation.name" class="w-full" />
        </UFormField>
        <UFormField label="类型" name="type" required>
          <USelect
            v-model="currentInnovation.type"
            class="w-full"
            :items="typeItems as any"
          />
        </UFormField>
        <UFormField label="时间" name="date" required>
          <UInput v-model="currentInnovation.date" class="w-full" type="date" />
        </UFormField>
        <UFormField
          label="成员排序"
          name="members"
          description="按顺序输入成员用户名"
        >
          <UInputTags v-model="membersTags" class="w-full" />
        </UFormField>
        <UFormField label="状态" name="status" required>
          <USelect
            v-model="currentInnovation.status"
            class="w-full"
            :items="statusItems as any"
          />
        </UFormField>
        <UFormField label="附件" name="evidences">
          <EvidencePreview :evidences="currentInnovation.evidences || []" />
        </UFormField>
      </UForm>
    </template>
    <template #footer>
      <UButton @click="editInnovation">保存</UButton>
    </template>
  </UModal>
</template>
