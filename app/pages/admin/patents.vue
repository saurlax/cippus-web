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

const { data: patents, refresh } = await useFetch<any>("/api/admin/patents", {
  query: {
    page,
    pageSize,
    search: searchText,
    status: statusFilter,
  },
});
const patentsList = computed(() => patents.value?.items || []);
const patentsTotal = computed(() => patents.value?.total || 0);

watch([searchText, statusFilter], () => {
  page.value = 1;
});

watch(patentsTotal, (total) => {
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

const typeItems = patentTypeValues.map((value) => ({
  value,
  label: t(`patents.type.${value}`),
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
  { accessorKey: "members", header: "成员排序" },
  { accessorKey: "date", header: "时间" },
  { accessorKey: "status", header: "状态" },
  { accessorKey: "updatedAt", header: "更新时间" },
  { id: "actions", header: "操作" },
];

const openModal = ref(false);
const currentPatent = ref<any>({});
const membersTags = ref<string[]>([]);

function openModalEditor(item?: any) {
  if (item) {
    currentPatent.value = {
      id: item.id,
      name: item.name,
      type: item.type,
      date: formatDateText(item.date),
      members: item.members || [],
      status: item.status,
      evidences: item.evidences || [],
      reviewReason: "",
    };
    membersTags.value = normalizeMembersList(item.members as string[]);
  } else {
    currentPatent.value = {};
    membersTags.value = [];
  }
  openModal.value = true;
}

function closeModal() {
  openModal.value = false;
}

async function editPatent() {
  if (!currentPatent.value?.id) {
    return;
  }

  await $fetch(`/api/admin/patents/${currentPatent.value.id}`, {
    method: "put",
    body: {
      name: currentPatent.value.name,
      type: currentPatent.value.type,
      date: currentPatent.value.date,
      members: normalizeMembersList(membersTags.value),
      status: currentPatent.value.status,
      reviewReason: currentPatent.value.reviewReason,
    },
  });

  closeModal();
  await refresh();
}
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="专利管理" />
    </template>

    <template #body>
      <div class="space-y-3">
        <div class="grid gap-3 sm:grid-cols-[minmax(0,20rem)_10rem]">
          <UFormField label="搜索" name="search">
            <UInput
              v-model="searchText"
              class="w-full"
              icon="i-lucide-search"
              placeholder="搜索专利"
            />
          </UFormField>
          <UFormField label="状态" name="status">
            <USelect v-model="statusFilter" :items="statusFilterItems" class="w-full" />
          </UFormField>
        </div>
        <UTable :data="patentsList" :columns>
        <template #type-cell="{ row }">
          {{ t(`patents.type.${row.original.type}`) }}
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
            共 {{ patentsTotal }} 条
          </p>
          <UPagination
            v-model:page="page"
            :items-per-page="pageSize"
            :total="patentsTotal"
            show-edges
          />
        </div>
      </div>
    </template>
  </UDashboardPanel>

  <UModal v-model:open="openModal" title="编辑专利">
    <template #body>
      <UForm class="flex flex-col gap-2" @submit.prevent="editPatent">
        <UFormField label="名称" name="name" required>
          <UInput v-model="currentPatent.name" class="w-full" />
        </UFormField>
        <UFormField label="类型" name="type" required>
          <USelect
            v-model="currentPatent.type"
            class="w-full"
            :items="typeItems as any"
          />
        </UFormField>
        <UFormField label="时间" name="date" required>
          <UInput v-model="currentPatent.date" class="w-full" type="date" />
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
            v-model="currentPatent.status"
            class="w-full"
            :items="statusItems as any"
          />
        </UFormField>
        <UFormField
          v-if="currentPatent.status === 'rejected'"
          label="拒绝理由"
          name="reviewReason"
          required
        >
          <UTextarea v-model="currentPatent.reviewReason" class="w-full" />
        </UFormField>
        <UFormField label="附件" name="evidences">
          <EvidencePreview :evidences="currentPatent.evidences || []" />
        </UFormField>
      </UForm>
    </template>
    <template #footer>
      <UButton @click="editPatent">保存</UButton>
    </template>
  </UModal>
</template>

