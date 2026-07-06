<script setup lang="ts">
const { user: sessionUser } = useUserSession();
const toast = useToast();
const { t } = useI18n();

const username = computed(() => sessionUser.value?.username || "");
const activeKind = ref<"award" | "paper" | "patent" | "innovation">("award");
const saving = ref(false);

const { data: contests } = await useFetch("/api/contests");
const { data: awards, refresh: refreshAwards } = await useFetch(
  `/api/users/${username.value}/awards`,
);
const { data: papers, refresh: refreshPapers } = await useFetch(
  `/api/users/${username.value}/papers`,
);
const { data: patents, refresh: refreshPatents } = await useFetch(
  `/api/users/${username.value}/patents`,
);
const { data: innovations, refresh: refreshInnovations } = await useFetch(
  `/api/users/${username.value}/innovations`,
);

type AwardRecord = NonNullable<typeof awards.value>[number];
type PaperRecord = NonNullable<typeof papers.value>[number];
type PatentRecord = NonNullable<typeof patents.value>[number];
type InnovationRecord = NonNullable<typeof innovations.value>[number];
type SourceRecord = AwardRecord | PaperRecord | PatentRecord;
type EditableRecord = AwardRecord | PaperRecord | PatentRecord | InnovationRecord;

const selectedRecord = ref<EditableRecord>();
const uploadFiles = ref<File[]>([]);
const memberTags = ref<string[]>([]);
const form = reactive({
  contestId: undefined as number | undefined,
  level: undefined as AwardLevel | undefined,
  type: undefined as AwardType | PaperType | PatentType | InnovationType | undefined,
  name: "",
  sourceType: undefined as InnovationAchievementType | undefined,
  sourceId: undefined as number | undefined,
  date: "",
  certificateDate: "",
  evidences: [] as string[],
});

const kindItems = [
  { label: "奖项", value: "award" },
  { label: "论文", value: "paper" },
  { label: "专利", value: "patent" },
  { label: "大创", value: "innovation" },
];
const contestItems = computed(() =>
  (contests.value || []).map((contest: any) => ({
    label: contest.title,
    value: contest.id,
  })),
);
const awardLevelItems = awardLevelValues.map((value) => ({
  value,
  label: t(`awards.level.${value}`),
}));
const awardTypeItems = awardTypeValues.map((value) => ({
  value,
  label: t(`awards.type.${value}`),
}));
const paperTypeItems = paperTypeValues.map((value) => ({
  value,
  label: t(`papers.type.${value}`),
}));
const patentTypeItems = patentTypeValues.map((value) => ({
  value,
  label: t(`patents.type.${value}`),
}));
const innovationTypeItems = innovationTypeValues.map((value) => ({
  value,
  label: t(`innovations.type.${value}`),
}));
const sourceTypeItems = innovationAchievementTypeValues.map((value) => ({
  value,
  label: t(`achievementTypes.${value}`),
}));

const awardsList = computed(() => awards.value || []);
const papersList = computed(() => papers.value || []);
const patentsList = computed(() => patents.value || []);
const innovationsList = computed(() => innovations.value || []);
const currentList = computed(() => {
  switch (activeKind.value) {
    case "award":
      return awardsList.value;
    case "paper":
      return papersList.value;
    case "patent":
      return patentsList.value;
    case "innovation":
      return innovationsList.value;
  }
});
const currentTitle = computed(() => kindItems.find((item) => item.value === activeKind.value)?.label || "成果");
const currentTypeItems = computed(() => {
  switch (activeKind.value) {
    case "award":
      return awardTypeItems;
    case "paper":
      return paperTypeItems;
    case "patent":
      return patentTypeItems;
    case "innovation":
      return innovationTypeItems;
  }
});
const sourceItems = computed(() => {
  if (!form.sourceType) {
    return [];
  }

  const records: Record<InnovationAchievementType, SourceRecord[]> = {
    award: awardsList.value,
    paper: papersList.value,
    patent: patentsList.value,
  };

  return records[form.sourceType]
    .filter((item) => item.status !== "rejected")
    .map((item) => ({
      value: item.id,
      label: getRecordTitle(form.sourceType!, item),
    }));
});

const isSupplementMode = computed(() => selectedRecord.value?.status === "approved");

function normalizeDateText(value: unknown) {
  if (!value) return "";
  if (typeof value === "string") return value.slice(0, 10);
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return "";
}

function normalizeMembersList(value: string[]) {
  return Array.from(new Set(value.map((item) => item.trim()).filter(Boolean)));
}

function defaultMembers() {
  return username.value ? [username.value] : [];
}

function getRecordTitle(kind: "award" | "paper" | "patent" | "innovation", item: any) {
  if (kind === "award") {
    return item.contest?.title || `奖项 #${item.id}`;
  }

  return item.name || `成果 #${item.id}`;
}

function getTypeText(kind: "award" | "paper" | "patent" | "innovation", item: any) {
  if (kind === "award") {
    return `${t(`awards.level.${item.level}`)} / ${t(`awards.type.${item.type}`)}`;
  }

  if (kind === "paper") return t(`papers.type.${item.type}`);
  if (kind === "patent") return t(`patents.type.${item.type}`);
  return t(`innovations.type.${item.type}`);
}

function statusColor(status: string) {
  switch (status) {
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

function reviewTimeline(item: any) {
  return ((item.reviewNotifications || []) as any[]).filter(
    (notification) => notification.reviewStatus === "rejected" && notification.reason,
  );
}

function resetForm() {
  selectedRecord.value = undefined;
  uploadFiles.value = [];
  memberTags.value = defaultMembers();
  form.contestId = undefined;
  form.level = undefined;
  form.type = undefined;
  form.name = "";
  form.sourceType = undefined;
  form.sourceId = undefined;
  form.date = "";
  form.certificateDate = "";
  form.evidences = [];
}

function editRecord(item: EditableRecord) {
  selectedRecord.value = item;
  uploadFiles.value = [];
  form.contestId = (item as any).contestId;
  form.level = (item as any).level;
  form.type = item.type as typeof form.type;
  form.name = (item as any).name || "";
  form.sourceType = (item as any).sourceType || undefined;
  form.sourceId = (item as any).sourceId || undefined;
  form.date = normalizeDateText(item.date);
  form.certificateDate = normalizeDateText((item as any).certificateDate);
  form.evidences = [...(item.evidences || [])];
  memberTags.value = Array.isArray((item as any).members) && (item as any).members.length
    ? [...((item as any).members as string[])]
    : defaultMembers();
}

async function uploadEvidences(files: File[]) {
  const uploaded: string[] = [];
  for (const file of files) {
    const formData = new FormData();
    formData.append("username", username.value);
    formData.append("file", file);
    const result = await $fetch<{ pathname: string }>("/api/blob/upload", {
      method: "post",
      body: formData,
    });
    uploaded.push(result.pathname);
  }
  return uploaded;
}

function removeEvidence(index: number) {
  form.evidences.splice(index, 1);
}

function pathForKind() {
  switch (activeKind.value) {
    case "award":
      return "awards";
    case "paper":
      return "papers";
    case "patent":
      return "patents";
    case "innovation":
      return "innovations";
  }
}

async function refreshCurrentList() {
  switch (activeKind.value) {
    case "award":
      await refreshAwards();
      return;
    case "paper":
      await refreshPapers();
      return;
    case "patent":
      await refreshPatents();
      return;
    case "innovation":
      await refreshInnovations();
  }
}

function validateCoreForm() {
  if (activeKind.value === "award" && (!form.contestId || !form.level || !form.type)) {
    toast.add({ title: "请完整填写奖项信息", color: "warning" });
    return false;
  }

  if (activeKind.value !== "award" && (!form.name.trim() || !form.type)) {
    toast.add({ title: "请完整填写成果信息", color: "warning" });
    return false;
  }

  if (activeKind.value === "innovation" && (!form.sourceType || !form.sourceId)) {
    toast.add({ title: "请选择大创关联成果", color: "warning" });
    return false;
  }

  if (!form.date) {
    toast.add({ title: "请选择时间", color: "warning" });
    return false;
  }

  const members = normalizeMembersList(memberTags.value);
  if (!members.includes(username.value)) {
    toast.add({ title: "成员排序必须包含自己", color: "warning" });
    return false;
  }

  return true;
}

async function saveRecord(status: "draft" | "pending" = "pending") {
  if (saving.value) return;
  if (!isSupplementMode.value && !validateCoreForm()) return;

  try {
    saving.value = true;
    const uploaded = await uploadEvidences(uploadFiles.value);
    const path = pathForKind();
    const evidenceBody = isSupplementMode.value
      ? uploaded
      : [...form.evidences, ...uploaded];
    const coreBody = activeKind.value === "award"
      ? {
          contestId: form.contestId,
          level: form.level,
          type: form.type,
          date: form.date,
          members: normalizeMembersList(memberTags.value),
          evidences: evidenceBody,
          status,
        }
      : {
          name: form.name,
          type: form.type,
          sourceType: form.sourceType,
          sourceId: form.sourceId,
          date: form.date,
          members: normalizeMembersList(memberTags.value),
          evidences: evidenceBody,
          status,
        };
    const supplementBody = {
      certificateDate: form.certificateDate || undefined,
      evidences: uploaded,
    };

    if (selectedRecord.value) {
      await $fetch(`/api/users/${username.value}/${path}/${selectedRecord.value.id}`, {
        method: "put",
        body: isSupplementMode.value ? supplementBody : coreBody,
      });
    } else {
      await $fetch(`/api/users/${username.value}/${path}`, {
        method: "post",
        body: coreBody,
      });
    }

    toast.add({ title: isSupplementMode.value ? "补充材料已提交" : "成果已保存", color: "success" });
    resetForm();
    await refreshCurrentList();
  } catch (e: any) {
    toast.add({
      title: "保存失败",
      description: e?.data?.message || e?.message,
      color: "error",
      icon: "i-lucide-circle-alert",
    });
  } finally {
    saving.value = false;
  }
}

watch(activeKind, () => resetForm());
</script>

<template>
  <UContainer>
    <UPageHeader title="奖项审核" description="提交成果审核，或为已通过成果补充证书日期和佐证材料。" />
    <UPageBody>
      <UTabs v-model="activeKind" :items="kindItems" class="mb-6" />

      <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <UPageCard :title="`${selectedRecord ? '编辑' : '新增'}${currentTitle}`">
          <UForm class="space-y-4" @submit.prevent="saveRecord('pending')">
            <UAlert
              v-if="isSupplementMode"
              color="success"
              variant="subtle"
              title="已通过审核的成果核心信息已锁定"
              description="这里只会追加证书日期和新的佐证材料，不会改变积分申报使用的计分字段。"
            />
            <template v-if="activeKind === 'award' && !isSupplementMode">
              <UFormField label="比赛" name="contestId" required>
                <USelect v-model="form.contestId" :items="contestItems" class="w-full" />
              </UFormField>
              <UFormField label="级别" name="level" required>
                <USelect v-model="form.level" :items="awardLevelItems" class="w-full" />
              </UFormField>
            </template>
            <template v-if="activeKind !== 'award' && !isSupplementMode">
              <UFormField label="名称" name="name" required>
                <UInput v-model="form.name" class="w-full" />
              </UFormField>
            </template>
            <UFormField v-if="!isSupplementMode" label="类型" name="type" required>
              <USelect v-model="form.type" :items="currentTypeItems" class="w-full" />
            </UFormField>
            <template v-if="activeKind === 'innovation' && !isSupplementMode">
              <UFormField label="成果类型" name="sourceType" required>
                <USelect
                  v-model="form.sourceType"
                  :items="sourceTypeItems"
                  class="w-full"
                  @update:model-value="form.sourceId = undefined"
                />
              </UFormField>
              <UFormField label="具体成果" name="sourceId" required>
                <USelect v-model="form.sourceId" :items="sourceItems" class="w-full" />
              </UFormField>
            </template>
            <UFormField v-if="!isSupplementMode" label="时间" name="date" required>
              <UInput v-model="form.date" class="w-full" type="date" />
            </UFormField>
            <UFormField v-if="!isSupplementMode" label="成员排序" name="members">
              <UInputTags v-model="memberTags" class="w-full" />
            </UFormField>
            <UFormField v-if="isSupplementMode" label="证书日期" name="certificateDate">
              <UInput v-model="form.certificateDate" class="w-full" type="date" />
            </UFormField>
            <UFormField label="佐证材料" name="evidences">
              <EvidenceUpload
                v-model="uploadFiles"
                :evidences="form.evidences"
                @remove-evidence="removeEvidence"
              />
            </UFormField>
          </UForm>
          <template #footer>
            <div class="flex w-full justify-end gap-2">
              <UButton color="neutral" variant="ghost" label="清空" @click="resetForm" />
              <UButton
                v-if="!selectedRecord"
                :loading="saving"
                variant="outline"
                label="保存草稿"
                @click="saveRecord('draft')"
              />
              <UButton :loading="saving" label="提交" @click="saveRecord('pending')" />
            </div>
          </template>
        </UPageCard>

        <div class="space-y-3">
          <UPageCard
            v-for="item in currentList"
            :key="item.id"
            :title="getRecordTitle(activeKind, item)"
          >
            <template #description>
              <div class="space-y-3">
                <div class="flex flex-wrap gap-1">
                  <UBadge>{{ getTypeText(activeKind, item) }}</UBadge>
                  <UBadge :color="statusColor(item.status)" variant="outline">
                    {{ t(`awards.status.${item.status}`) }}
                  </UBadge>
                  <UBadge v-if="item.certificateDate" color="neutral" variant="outline">
                    证书 {{ normalizeDateText(item.certificateDate) }}
                  </UBadge>
                </div>
                <div v-if="reviewTimeline(item).length" class="space-y-2">
                  <p class="text-sm font-medium text-error">拒绝理由</p>
                  <div
                    v-for="notification in reviewTimeline(item)"
                    :key="notification.id"
                    class="rounded-md border border-error/20 p-2 text-sm"
                  >
                    <p>{{ notification.reason }}</p>
                    <p class="mt-1 text-xs text-muted">
                      {{ new Date(notification.createdAt).toLocaleString() }}
                    </p>
                  </div>
                </div>
                <UButton
                  size="sm"
                  variant="outline"
                  :label="item.status === 'approved' ? '补充材料' : '编辑'"
                  @click="editRecord(item)"
                />
              </div>
            </template>
          </UPageCard>
          <UEmpty v-if="!currentList.length" variant="naked" title="暂无记录" />
        </div>
      </div>
    </UPageBody>
  </UContainer>
</template>