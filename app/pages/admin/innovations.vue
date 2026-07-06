<script setup lang="ts">
const UButton = resolveComponent("UButton");

const { t } = useI18n();
const searchText = ref("");
const statusFilter = ref("all");
const page = ref(1);
const pageSize = 10;
const statusFilterItems = computed(() => [
  { label: "全部状态", value: "all" },
  ...["pending", "approved", "rejected", "draft"].map((value) => ({
    label: t(`status.${value}`),
    value,
  })),
]);

const { data: innovations, refresh } = await useFetch<any>(
  "/api/admin/innovations",
  {
    query: {
      page,
      pageSize,
      search: searchText,
      status: statusFilter,
    },
  },
);
const innovationsList = computed(() => innovations.value?.items || []);
const innovationsTotal = computed(() => innovations.value?.total || 0);

watch([searchText, statusFilter], () => {
  page.value = 1;
});

watch(innovationsTotal, (total) => {
  const maxPage = Math.max(1, Math.ceil(total / pageSize));

  if (page.value > maxPage) {
    page.value = maxPage;
  }
});

function formatDateText(value: unknown) {
  if (!value || typeof value !== "string") {
    return "";
  }

  return value.slice(0, 10);
}

function formatDateTimeText(value: unknown) {
  if (!value) {
    return "-";
  }

  return new Date(String(value)).toLocaleString();
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
  label: t(`status.${value}`),
}));

const columns = [
  { accessorKey: "id", header: "#" },
  { accessorKey: "user.username", header: "用户" },
  { accessorKey: "name", header: "名称" },
  { accessorKey: "type", header: "类型" },
  { accessorKey: "sourceSummary", header: "关联成果" },
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
      sourceType: item.sourceType,
      sourceId: item.sourceId,
      sourceSummary: item.sourceSummary || "",
      date: formatDateText(item.date),
      members: item.members || [],
      status: item.status,
      evidences: item.evidences || [],
      reviewReason: "",
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
      reviewReason: currentInnovation.value.reviewReason,
    },
  });

  closeModal();
  await refresh();
}
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="大创管理" />
    </template>

    <template #body>
      <div class="space-y-3">
        <div class="grid gap-3 sm:grid-cols-[minmax(0,20rem)_10rem]">
          <UFormField label="搜索" name="search">
            <UInput
              v-model="searchText"
              class="w-full"
              icon="i-lucide-search"
              placeholder="搜索大创"
            />
          </UFormField>
          <UFormField label="状态" name="status">
            <USelect v-model="statusFilter" :items="statusFilterItems" class="w-full" />
          </UFormField>
        </div>
        <UTable :data="innovationsList" :columns>
        <template #type-cell="{ row }">
          {{ t(`innovations.type.${row.original.type}`) }}
        </template>
        <template #members-cell="{ row }">
          {{ formatMembersText(row.original.members) || "-" }}
        </template>
        <template #date-cell="{ row }">
          {{ formatDateTimeText(row.original.date) }}
        </template>
        <template #status-cell="{ row }">
          {{ t(`status.${row.original.status}`) }}
        </template>
        <template #updatedAt-cell="{ row }">
          {{ formatDateTimeText(row.original.updatedAt) }}
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
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p class="text-sm text-muted">
            共 {{ innovationsTotal }} 条
          </p>
          <UPagination
            v-model:page="page"
            :items-per-page="pageSize"
            :total="innovationsTotal"
            show-edges
          />
        </div>
      </div>
    </template>
  </UDashboardPanel>

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
        <UFormField label="关联成果" name="sourceSummary">
          <UInput
            :model-value="currentInnovation.sourceSummary || '未设置'"
            class="w-full"
            readonly
          />
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
        <UFormField
          v-if="currentInnovation.status === 'rejected'"
          label="拒绝理由"
          name="reviewReason"
          required
        >
          <UTextarea v-model="currentInnovation.reviewReason" class="w-full" />
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

