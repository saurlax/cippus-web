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
  { label: "证书待审", value: "certificate_pending" },
]);

const { data: awards, refresh } = await useFetch<any>("/api/admin/awards", {
  query: {
    page,
    pageSize,
    search: searchText,
    status: statusFilter,
  },
});
const awardsList = computed(() => awards.value?.items || []);
const awardsTotal = computed(() => awards.value?.total || 0);

watch([searchText, statusFilter], () => {
  page.value = 1;
});

watch(awardsTotal, (total) => {
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

function statusColor(status: unknown) {
  switch (String(status ?? "")) {
    case "pending":
      return "warning";
    case "approved":
      return "success";
    case "rejected":
      return "error";
    default:
      return "neutral";
  }
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
  label: t(`status.${value}`),
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
const reviewingCertificate = ref(false);
const certificateRejectReason = ref("");

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
      certificateStatus: item.certificateStatus || "none",
      certificateDate: formatDateText(item.certificateDate),
      certificateEvidences: item.certificateEvidences || [],
      reviewReason: "",
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
      reviewReason: currentAward.value.reviewReason,
    },
  });

  closeModal();
  await refresh();
}

// 审核用户补充的证书材料（只影响 certificateStatus，不影响成果状态）
async function reviewCertificate(status: "approved" | "rejected") {
  if (!currentAward.value?.id || reviewingCertificate.value) {
    return;
  }

  if (status === "rejected" && !certificateRejectReason.value.trim()) {
    alert("拒绝补充证书时必须填写理由");
    return;
  }

  try {
    reviewingCertificate.value = true;
    await $fetch(`/api/admin/awards/${currentAward.value.id}/certificate`, {
      method: "put",
      body: {
        status,
        reason: certificateRejectReason.value,
      },
    });
    certificateRejectReason.value = "";
    closeModal();
    await refresh();
  } finally {
    reviewingCertificate.value = false;
  }
}
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="奖项管理" />
    </template>

    <template #body>
      <div class="space-y-3">
        <div class="grid gap-3 sm:grid-cols-[minmax(0,20rem)_10rem]">
          <UFormField label="搜索" name="search">
            <UInput
              v-model="searchText"
              class="w-full"
              icon="i-lucide-search"
              placeholder="搜索奖项"
            />
          </UFormField>
          <UFormField label="状态" name="status">
            <USelect v-model="statusFilter" :items="statusFilterItems" class="w-full" />
          </UFormField>
        </div>
        <UTable :data="awardsList" :columns>
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
          {{ formatDateTimeText(row.original.date) }}
        </template>
        <template #status-cell="{ row }">
          <div class="flex flex-wrap items-center gap-1">
            <UBadge :color="statusColor(row.original.status)" variant="outline">
              {{ t(`status.${row.original.status}`) }}
            </UBadge>
            <UBadge
              v-if="row.original.certificateStatus === 'pending'"
              color="warning"
              variant="subtle"
            >
              证书待审
            </UBadge>
            <UBadge
              v-else-if="row.original.certificateStatus === 'rejected'"
              color="error"
              variant="subtle"
            >
              证书被拒
            </UBadge>
            <UBadge
              v-else-if="row.original.certificateStatus === 'approved'"
              color="success"
              variant="subtle"
            >
              证书已通过
            </UBadge>
          </div>
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
            共 {{ awardsTotal }} 条
          </p>
          <UPagination
            v-model:page="page"
            :items-per-page="pageSize"
            :total="awardsTotal"
            show-edges
          />
        </div>
      </div>
    </template>
  </UDashboardPanel>

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
        <UFormField
          v-if="currentAward.status === 'rejected'"
          label="拒绝理由"
          name="reviewReason"
          required
        >
          <UTextarea v-model="currentAward.reviewReason" class="w-full" />
        </UFormField>
        <UFormField label="附件" name="evidences">
          <EvidencePreview :evidences="currentAward.evidences || []" />
        </UFormField>

        <template v-if="currentAward.certificateStatus === 'pending'">
          <UFormField label="待审证书日期" name="certificateDate">
            <UInput
              :model-value="currentAward.certificateDate"
              class="w-full"
              type="date"
              disabled
            />
          </UFormField>
          <UFormField label="待审证书佐证" name="certificateEvidences">
            <EvidencePreview :evidences="currentAward.certificateEvidences || []" />
          </UFormField>
          <UFormField label="拒绝理由" name="certificateRejectReason">
            <UTextarea
              v-model="certificateRejectReason"
              class="w-full"
              placeholder="拒绝补充证书时必填"
            />
          </UFormField>
        </template>
      </UForm>
    </template>
    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <template v-if="currentAward.certificateStatus === 'pending'">
          <UButton
            color="error"
            variant="outline"
            :loading="reviewingCertificate"
            @click="reviewCertificate('rejected')"
          >
            拒绝证书
          </UButton>
          <UButton
            color="success"
            :loading="reviewingCertificate"
            @click="reviewCertificate('approved')"
          >
            通过证书
          </UButton>
        </template>
        <UButton @click="editAward">保存</UButton>
      </div>
    </template>
  </UModal>
</template>

