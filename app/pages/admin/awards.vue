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
  { accessorKey: "level", header: "级别" },
  { accessorKey: "type", header: "类型" },
  { accessorKey: "members", header: "成员排序" },
  { accessorKey: "date", header: "获奖时间" },
  { accessorKey: "status", header: "状态" },
  { accessorKey: "updatedAt", header: "更新时间" },
  { id: "actions", header: "操作" },
];

const openModal = ref(false);
const currentAward = ref<any>({});
const membersTags = ref<string[]>([]);

function openModalEditor(item?: any) {
  if (item) {
    currentAward.value = {
      id: item.id,
      status: item.status,
      level: item.level,
      type: item.type,
      date: formatDateText(item.date),
      members: item.members || [],
      evidences: item.evidences || [],
    };
    membersTags.value = normalizeMembersList(item.members as string[]);
  } else {
    currentAward.value = {};
    membersTags.value = [];
  }
  openModal.value = true;
}

function closeModal() {
  openModal.value = false;
}

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
      members: normalizeMembersList(membersTags.value),
    },
  });

  closeModal();
  await refresh();
}
</script>

<template>
  <UDashboardNavbar title="奖项管理"></UDashboardNavbar>
  <UTable :data="awards" :columns>
    <template #level-cell="{ row }">
      {{ t(`awards.level.${row.original.level}`) }}
    </template>
    <template #type-cell="{ row }">
      {{ t(`awards.type.${row.original.type}`) }}
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
        <UFormField
          label="成员排序"
          name="members"
          description="按顺序输入成员用户名"
        >
          <UInputTags v-model="membersTags" class="w-full" />
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
