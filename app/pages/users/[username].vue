<script setup lang="ts">
const route = useRoute();
const { user: sessionUser } = useUserSession();
const toast = useToast();
const { t } = useI18n();

const username = computed(() => String(route.params.username || ""));
const isSelf = computed(() => sessionUser.value?.username === username.value);
const canEditRecords = computed(
  () =>
    !!sessionUser.value &&
    (sessionUser.value.username === username.value || sessionUser.value.admin),
);

const { data: user, refresh: refreshUser } = await useFetch(
  `/api/users/${username.value}`,
);
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
const { data: contests } = await useFetch("/api/contests");

type AwardWithContest = NonNullable<typeof awards.value>[number];
type PaperRecord = NonNullable<typeof papers.value>[number];
type PatentRecord = NonNullable<typeof patents.value>[number];
type InnovationRecord = NonNullable<typeof innovations.value>[number];
type RecordKind = "paper" | "patent" | "innovation";
type UserSubmitStatus = "draft" | "pending";

if (!user.value) {
  throw createError({ statusCode: 404, statusMessage: "User not found" });
}

const openEdit = ref(false);
const saving = ref(false);
const form = reactive({
  name: "",
  bio: "",
  email: "",
  gender: "",
  college: "",
  password: "",
});

const openAward = ref(false);
const savingAward = ref(false);
const selectedAward = ref<AwardWithContest>();
const awardForm = reactive({
  contestId: undefined as number | undefined,
  level: undefined as AwardLevel | undefined,
  type: undefined as AwardType | undefined,
  date: "",
  members: [] as string[],
  evidences: [] as string[],
});
const awardUploadFiles = ref<File[]>([]);
const awardMembersTags = ref<string[]>([]);

const openRecord = ref(false);
const savingRecord = ref(false);
const currentRecordKind = ref<RecordKind>("paper");
const selectedRecordId = ref<number>();
const selectedRecordStatus = ref<string>();
const recordForm = reactive({
  name: "",
  type: undefined as PaperType | PatentType | InnovationType | undefined,
  date: "",
  members: [] as string[],
  evidences: [] as string[],
});
const recordUploadFiles = ref<File[]>([]);
const recordMembersTags = ref<string[]>([]);

const genderItems = ref([
  { label: "男", value: "male" },
  { label: "女", value: "female" },
]);

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

const awardsList = computed(() => awards.value || []);
const papersList = computed(() => papers.value || []);
const patentsList = computed(() => patents.value || []);
const innovationsList = computed(() => innovations.value || []);

const currentRecordTypeItems = computed(() => {
  switch (currentRecordKind.value) {
    case "paper":
      return paperTypeItems;
    case "patent":
      return patentTypeItems;
    case "innovation":
      return innovationTypeItems;
  }
});
const currentRecordSectionTitle = computed(() => {
  switch (currentRecordKind.value) {
    case "paper":
      return "论文";
    case "patent":
      return "专利";
    case "innovation":
      return "大创";
  }
});
const currentRecordModalTitle = computed(
  () =>
    `${selectedRecordId.value ? "编辑" : "添加"}${currentRecordSectionTitle.value}`,
);

const genderIcon = computed(() => {
  const value = (user.value?.gender || "").toLowerCase();

  if (value === "male") {
    return { name: "i-lucide-mars", class: "text-sky-500" };
  }

  if (value === "female") {
    return { name: "i-lucide-venus", class: "text-pink-500" };
  }

  return { name: "i-lucide-venus-and-mars", class: "text-muted" };
});

function normalizeDateText(value: unknown) {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value.slice(0, 10);
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return "";
}

function statusColor(status: string) {
  switch (status) {
    case "pending":
      return "warning";
    case "draft":
      return "neutral";
    case "approved":
      return "success";
    case "rejected":
      return "error";
    default:
      return "neutral";
  }
}

async function uploadEvidences(files: File[]) {
  if (!files.length) {
    return [] as string[];
  }

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

function removeEvidence(list: string[], index: number) {
  list.splice(index, 1);
}

function getRecordTypeLabel(kind: RecordKind, value: string) {
  switch (kind) {
    case "paper":
      return t(`papers.type.${value}`);
    case "patent":
      return t(`patents.type.${value}`);
    case "innovation":
      return t(`innovations.type.${value}`);
  }
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

function defaultMembers() {
  return username.value ? [username.value] : [];
}

function canEditOwnedRecord(ownerUserId: number | undefined) {
  if (!canEditRecords.value) {
    return false;
  }

  const ownerId = Number(ownerUserId || 0);
  const currentProfileId = Number(user.value?.id || 0);
  return ownerId > 0 && ownerId === currentProfileId;
}

function startEdit() {
  if (!user.value) {
    return;
  }

  form.name = user.value.name || "";
  form.bio = user.value.bio || "";
  form.email = "";
  form.gender = user.value.gender || "male";
  form.college = user.value.college || "";
  form.password = "";
  openEdit.value = true;
}

function startAddAward() {
  selectedAward.value = undefined;
  awardForm.contestId = undefined;
  awardForm.level = undefined;
  awardForm.type = undefined;
  awardForm.date = "";
  awardForm.members = defaultMembers();
  awardMembersTags.value = [...awardForm.members];
  awardForm.evidences = [];
  awardUploadFiles.value = [];
  openAward.value = true;
}

function startEditAward(award: AwardWithContest) {
  if (!canEditOwnedRecord(Number((award as any).userId))) {
    return;
  }

  selectedAward.value = award;
  awardForm.contestId = award.contestId;
  awardForm.level = award.level as AwardLevel;
  awardForm.type = award.type as AwardType;
  awardForm.date = normalizeDateText(award.date);
  awardForm.members =
    Array.isArray((award as any).members) && (award as any).members.length
      ? [...((award as any).members as string[])]
      : defaultMembers();
  awardMembersTags.value = [...awardForm.members];
  awardForm.evidences = [...(award.evidences || [])];
  awardUploadFiles.value = [];
  openAward.value = true;
}

function startRecord(
  kind: RecordKind,
  item?: PaperRecord | PatentRecord | InnovationRecord,
) {
  if (item && !canEditOwnedRecord(Number((item as any).userId))) {
    return;
  }

  currentRecordKind.value = kind;
  selectedRecordId.value = item?.id;
  selectedRecordStatus.value = item?.status;
  recordForm.name = item?.name || "";
  recordForm.type = (item?.type || undefined) as
    | PaperType
    | PatentType
    | InnovationType
    | undefined;
  recordForm.date = normalizeDateText(item?.date);
  recordForm.members = item
    ? Array.isArray((item as any).members) && (item as any).members.length
      ? [...((item as any).members as string[])]
      : defaultMembers()
    : defaultMembers();
  recordMembersTags.value = [...recordForm.members];
  recordForm.evidences = [...((item?.evidences as string[] | undefined) || [])];
  recordUploadFiles.value = [];
  openRecord.value = true;
}

async function saveProfile() {
  if (!user.value || saving.value) {
    return;
  }

  try {
    saving.value = true;
    await $fetch(`/api/users`, {
      method: "PUT",
      body: {
        name: form.name,
        bio: form.bio,
        email: form.email,
        gender: form.gender,
        college: form.college,
        password: form.password,
      },
    });

    await refreshUser();
    openEdit.value = false;
    toast.add({
      title: "资料已更新",
      color: "success",
      icon: "i-lucide-check",
    });
  } catch (e: any) {
    toast.add({
      title: "更新失败",
      description: e?.data?.message || e?.message,
      color: "error",
      icon: "i-lucide-circle-alert",
    });
  } finally {
    saving.value = false;
  }
}

async function saveAward(status: UserSubmitStatus) {
  if (savingAward.value) {
    return;
  }
  if (!awardForm.contestId) {
    toast.add({ title: "请选择比赛", color: "warning" });
    return;
  }
  if (!awardForm.level) {
    toast.add({ title: "请选择奖项级别", color: "warning" });
    return;
  }
  if (!awardForm.type) {
    toast.add({ title: "请选择奖项类型", color: "warning" });
    return;
  }
  if (!awardForm.date) {
    toast.add({ title: "请选择获奖时间", color: "warning" });
    return;
  }

  awardForm.members = normalizeMembersList(awardMembersTags.value);
  if (!awardForm.members.length) {
    toast.add({ title: "请至少填写一个成员用户名", color: "warning" });
    return;
  }

  try {
    savingAward.value = true;
    const uploadedEvidences = await uploadEvidences(awardUploadFiles.value);
    const evidences = [...awardForm.evidences, ...uploadedEvidences];

    if (selectedAward.value) {
      await $fetch(
        `/api/users/${username.value}/awards/${selectedAward.value.id}`,
        {
          method: "put",
          body: {
            contestId: awardForm.contestId,
            level: awardForm.level,
            type: awardForm.type,
            date: awardForm.date,
            members: awardForm.members,
            evidences,
            status,
          },
        },
      );
      toast.add({
        title: "奖项已更新并提交审核",
        color: "success",
        icon: "i-lucide-check",
      });
    } else {
      await $fetch(`/api/users/${username.value}/awards`, {
        method: "post",
        body: {
          contestId: awardForm.contestId,
          level: awardForm.level,
          type: awardForm.type,
          date: awardForm.date,
          members: awardForm.members,
          evidences,
          status,
        },
      });
      toast.add({
        title: status === "pending" ? "奖项已提交审核" : "奖项草稿已保存",
        color: "success",
        icon: "i-lucide-check",
      });
    }

    await refreshAwards();
    awardUploadFiles.value = [];
    openAward.value = false;
  } catch (e: any) {
    toast.add({
      title: selectedAward.value ? "更新失败" : "添加失败",
      description: e?.data?.message || e?.message,
      color: "error",
      icon: "i-lucide-circle-alert",
    });
  } finally {
    savingAward.value = false;
  }
}

function getRecordPath(kind: RecordKind) {
  switch (kind) {
    case "paper":
      return "papers";
    case "patent":
      return "patents";
    case "innovation":
      return "innovations";
  }
}

async function refreshRecordList(kind: RecordKind) {
  switch (kind) {
    case "paper":
      await refreshPapers();
      return;
    case "patent":
      await refreshPatents();
      return;
    case "innovation":
      await refreshInnovations();
      return;
  }
}

async function saveRecord() {
  if (savingRecord.value) {
    return;
  }
  if (!recordForm.name.trim()) {
    toast.add({ title: "请输入名称", color: "warning" });
    return;
  }
  if (!recordForm.type) {
    toast.add({ title: "请选择类型", color: "warning" });
    return;
  }
  if (!recordForm.date) {
    toast.add({ title: "请选择时间", color: "warning" });
    return;
  }

  recordForm.members = normalizeMembersList(recordMembersTags.value);
  if (!recordForm.members.length) {
    toast.add({ title: "请至少填写一个成员用户名", color: "warning" });
    return;
  }

  const path = getRecordPath(currentRecordKind.value);

  try {
    savingRecord.value = true;
    const uploadedEvidences = await uploadEvidences(recordUploadFiles.value);
    const evidences = [...recordForm.evidences, ...uploadedEvidences];

    if (selectedRecordId.value) {
      await $fetch(
        `/api/users/${username.value}/${path}/${selectedRecordId.value}`,
        {
          method: "put",
          body: {
            name: recordForm.name,
            type: recordForm.type,
            date: recordForm.date,
            members: recordForm.members,
            evidences,
            status: "pending",
          },
        },
      );
      toast.add({
        title: `${currentRecordSectionTitle.value}已更新并提交审核`,
        color: "success",
        icon: "i-lucide-check",
      });
    } else {
      await $fetch(`/api/users/${username.value}/${path}`, {
        method: "post",
        body: {
          name: recordForm.name,
          type: recordForm.type,
          date: recordForm.date,
          members: recordForm.members,
          evidences,
          status: "pending",
        },
      });
      toast.add({
        title: `${currentRecordSectionTitle.value}已提交审核`,
        color: "success",
        icon: "i-lucide-check",
      });
    }

    await refreshRecordList(currentRecordKind.value);
    recordUploadFiles.value = [];
    openRecord.value = false;
  } catch (e: any) {
    toast.add({
      title: selectedRecordId.value ? "更新失败" : "添加失败",
      description: e?.data?.message || e?.message,
      color: "error",
      icon: "i-lucide-circle-alert",
    });
  } finally {
    savingRecord.value = false;
  }
}

async function saveRecordDraft() {
  if (savingRecord.value) {
    return;
  }
  if (!recordForm.name.trim()) {
    toast.add({ title: "请输入名称", color: "warning" });
    return;
  }
  if (!recordForm.type) {
    toast.add({ title: "请选择类型", color: "warning" });
    return;
  }
  if (!recordForm.date) {
    toast.add({ title: "请选择时间", color: "warning" });
    return;
  }

  recordForm.members = normalizeMembersList(recordMembersTags.value);
  if (!recordForm.members.length) {
    toast.add({ title: "请至少填写一个成员用户名", color: "warning" });
    return;
  }

  const path = getRecordPath(currentRecordKind.value);

  try {
    savingRecord.value = true;
    const uploadedEvidences = await uploadEvidences(recordUploadFiles.value);
    const evidences = [...recordForm.evidences, ...uploadedEvidences];

    await $fetch(`/api/users/${username.value}/${path}`, {
      method: "post",
      body: {
        name: recordForm.name,
        type: recordForm.type,
        date: recordForm.date,
        members: recordForm.members,
        evidences,
        status: "draft",
      },
    });

    toast.add({
      title: `${currentRecordSectionTitle.value}草稿已保存`,
      color: "success",
      icon: "i-lucide-check",
    });

    await refreshRecordList(currentRecordKind.value);
    recordUploadFiles.value = [];
    openRecord.value = false;
  } catch (e: any) {
    toast.add({
      title: "保存失败",
      description: e?.data?.message || e?.message,
      color: "error",
      icon: "i-lucide-circle-alert",
    });
  } finally {
    savingRecord.value = false;
  }
}
</script>

<template>
  <UContainer v-if="user">
    <UPageHeader headline="用户" :description="user.college || ''">
      <template #title>
        <div class="flex items-center gap-2">
          <span>{{ user.name || user.username }}</span>
          <UIcon :name="genderIcon.name" :class="genderIcon.class" />
        </div>
      </template>

      <template #links>
        <UButton
          v-if="isSelf"
          variant="outline"
          icon="i-lucide-pencil"
          label="编辑资料"
          @click="startEdit"
        />
      </template>
    </UPageHeader>

    <UPage>
      <UPageBody>
        <UPageCard title="个人简介">
          <UEmpty
            v-if="!isSelf && !user.bio"
            variant="naked"
            title="暂无简介"
          />
          <MDC v-else :value="user.bio || '尚无简介'" />
        </UPageCard>

        <UPageCard title="奖项">
          <UPageGrid cols="1 sm:2 md:3" gap="4" class="mt-4">
            <UPageCard
              v-if="canEditRecords"
              class="cursor-pointer"
              icon="i-lucide-plus"
              description="添加奖项"
              spotlight
              @click="startAddAward"
            />
            <UPageCard
              v-for="award in awardsList"
              :key="award.id"
              :class="canEditOwnedRecord(award.userId) ? 'cursor-pointer' : ''"
              :title="award.contest?.title || '未知比赛'"
              @click="startEditAward(award)"
            >
              <template #description>
                <div class="space-y-2">
                  <p class="text-sm text-muted">
                    获奖时间：{{ normalizeDateText(award.date) }}
                  </p>
                  <div class="flex flex-wrap gap-1">
                    <UBadge v-if="award.level">{{
                      t(`awards.level.${award.level}`)
                    }}</UBadge>
                    <UBadge v-if="award.type">{{
                      t(`awards.type.${award.type}`)
                    }}</UBadge>
                    <UBadge
                      v-if="(award.evidences || []).length"
                      color="neutral"
                      variant="outline"
                    >
                      附件 {{ (award.evidences || []).length }}
                    </UBadge>
                    <UBadge color="neutral" variant="outline">
                      成员
                      {{
                        (((award as any).members as string[] | undefined) || [])
                          .length
                      }}
                    </UBadge>
                    <UBadge
                      :color="statusColor(award.status)"
                      variant="outline"
                    >
                      {{ t(`awards.status.${award.status}`) }}
                    </UBadge>
                  </div>
                </div>
              </template>
            </UPageCard>
          </UPageGrid>
          <UEmpty
            v-if="!isSelf && !awardsList.length"
            variant="naked"
            title="暂无奖项"
          />
        </UPageCard>

        <UPageCard title="论文">
          <UPageGrid cols="1 sm:2 md:3" gap="4" class="mt-4">
            <UPageCard
              v-if="canEditRecords"
              class="cursor-pointer"
              icon="i-lucide-plus"
              description="添加论文"
              spotlight
              @click="startRecord('paper')"
            />
            <UPageCard
              v-for="paper in papersList"
              :key="paper.id"
              :class="canEditOwnedRecord(paper.userId) ? 'cursor-pointer' : ''"
              :title="paper.name"
              @click="startRecord('paper', paper)"
            >
              <template #description>
                <div class="space-y-2">
                  <p class="text-sm text-muted">
                    时间：{{ normalizeDateText(paper.date) }}
                  </p>
                  <div class="flex flex-wrap gap-1">
                    <UBadge>{{ t(`papers.type.${paper.type}`) }}</UBadge>
                    <UBadge
                      v-if="(paper.evidences || []).length"
                      color="neutral"
                      variant="outline"
                    >
                      附件 {{ (paper.evidences || []).length }}
                    </UBadge>
                    <UBadge color="neutral" variant="outline">
                      成员
                      {{
                        (((paper as any).members as string[] | undefined) || [])
                          .length
                      }}
                    </UBadge>
                    <UBadge
                      :color="statusColor(paper.status)"
                      variant="outline"
                    >
                      {{ t(`awards.status.${paper.status}`) }}
                    </UBadge>
                  </div>
                </div>
              </template>
            </UPageCard>
          </UPageGrid>
          <UEmpty
            v-if="!isSelf && !papersList.length"
            variant="naked"
            title="暂无论文"
          />
        </UPageCard>

        <UPageCard title="专利">
          <UPageGrid cols="1 sm:2 md:3" gap="4" class="mt-4">
            <UPageCard
              v-if="canEditRecords"
              class="cursor-pointer"
              icon="i-lucide-plus"
              description="添加专利"
              spotlight
              @click="startRecord('patent')"
            />
            <UPageCard
              v-for="patent in patentsList"
              :key="patent.id"
              :class="canEditOwnedRecord(patent.userId) ? 'cursor-pointer' : ''"
              :title="patent.name"
              @click="startRecord('patent', patent)"
            >
              <template #description>
                <div class="space-y-2">
                  <p class="text-sm text-muted">
                    时间：{{ normalizeDateText(patent.date) }}
                  </p>
                  <div class="flex flex-wrap gap-1">
                    <UBadge>{{ t(`patents.type.${patent.type}`) }}</UBadge>
                    <UBadge
                      v-if="(patent.evidences || []).length"
                      color="neutral"
                      variant="outline"
                    >
                      附件 {{ (patent.evidences || []).length }}
                    </UBadge>
                    <UBadge color="neutral" variant="outline">
                      成员
                      {{
                        (
                          ((patent as any).members as string[] | undefined) ||
                          []
                        ).length
                      }}
                    </UBadge>
                    <UBadge
                      :color="statusColor(patent.status)"
                      variant="outline"
                    >
                      {{ t(`awards.status.${patent.status}`) }}
                    </UBadge>
                  </div>
                </div>
              </template>
            </UPageCard>
          </UPageGrid>
          <UEmpty
            v-if="!isSelf && !patentsList.length"
            variant="naked"
            title="暂无专利"
          />
        </UPageCard>

        <UPageCard title="大创">
          <UPageGrid cols="1 sm:2 md:3" gap="4" class="mt-4">
            <UPageCard
              v-if="canEditRecords"
              class="cursor-pointer"
              icon="i-lucide-plus"
              description="添加大创"
              spotlight
              @click="startRecord('innovation')"
            />
            <UPageCard
              v-for="innovation in innovationsList"
              :key="innovation.id"
              :class="
                canEditOwnedRecord(innovation.userId) ? 'cursor-pointer' : ''
              "
              :title="innovation.name"
              @click="startRecord('innovation', innovation)"
            >
              <template #description>
                <div class="space-y-2">
                  <p class="text-sm text-muted">
                    时间：{{ normalizeDateText(innovation.date) }}
                  </p>
                  <div class="flex flex-wrap gap-1">
                    <UBadge>{{
                      t(`innovations.type.${innovation.type}`)
                    }}</UBadge>
                    <UBadge
                      v-if="(innovation.evidences || []).length"
                      color="neutral"
                      variant="outline"
                    >
                      附件 {{ (innovation.evidences || []).length }}
                    </UBadge>
                    <UBadge color="neutral" variant="outline">
                      成员
                      {{
                        (
                          ((innovation as any).members as
                            | string[]
                            | undefined) || []
                        ).length
                      }}
                    </UBadge>
                    <UBadge
                      :color="statusColor(innovation.status)"
                      variant="outline"
                    >
                      {{ t(`awards.status.${innovation.status}`) }}
                    </UBadge>
                  </div>
                </div>
              </template>
            </UPageCard>
          </UPageGrid>
          <UEmpty
            v-if="!isSelf && !innovationsList.length"
            variant="naked"
            title="暂无大创"
          />
        </UPageCard>
      </UPageBody>
    </UPage>

    <UModal v-model:open="openEdit" title="编辑资料">
      <template #body>
        <UForm class="space-y-4" @submit.prevent="saveProfile">
          <UFormField label="姓名" name="name">
            <UInput v-model="form.name" class="w-full" />
          </UFormField>
          <UFormField label="简介" name="bio">
            <UTextarea v-model="form.bio" class="w-full" :rows="4" />
          </UFormField>
          <UFormField label="邮箱" name="email">
            <UInput v-model="form.email" class="w-full" type="email" />
          </UFormField>
          <UFormField label="性别" name="gender">
            <USelect
              v-model="form.gender"
              :items="genderItems"
              class="w-full"
              placeholder="请选择性别"
            />
          </UFormField>
          <UFormField label="学院" name="college">
            <UInput v-model="form.college" class="w-full" />
          </UFormField>
          <UFormField
            label="新密码"
            name="password"
            description="留空表示保持当前密码"
          >
            <UInput v-model="form.password" class="w-full" type="password" />
          </UFormField>
        </UForm>
      </template>

      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton
            color="neutral"
            variant="ghost"
            label="取消"
            @click="openEdit = false"
          />
          <UButton :loading="saving" label="保存" @click="saveProfile" />
        </div>
      </template>
    </UModal>

    <UModal
      v-model:open="openAward"
      :title="selectedAward ? '编辑奖项' : '添加奖项'"
    >
      <template #body>
        <UForm
          class="space-y-4"
          @submit.prevent="saveAward(selectedAward ? 'pending' : 'draft')"
        >
          <UAlert
            v-if="selectedAward?.status === 'approved'"
            color="warning"
            variant="subtle"
            title="修改已通过的奖项将会重新进入待审核状态"
          />
          <UFormField label="比赛" name="contestId" required>
            <USelect
              v-model="awardForm.contestId"
              :items="contestItems"
              class="w-full"
              placeholder="请选择比赛"
            />
          </UFormField>
          <UFormField label="级别" name="level" required>
            <USelect
              v-model="awardForm.level"
              :items="awardLevelItems"
              class="w-full"
              placeholder="请选择级别"
            />
          </UFormField>
          <UFormField label="类型" name="type" required>
            <USelect
              v-model="awardForm.type"
              :items="awardTypeItems"
              class="w-full"
              placeholder="请选择类型"
            />
          </UFormField>
          <UFormField label="获奖时间" name="date" required>
            <UInput v-model="awardForm.date" class="w-full" type="date" />
          </UFormField>
          <UFormField
            label="成员排序"
            name="members"
            description="按顺序输入成员用户名，顺序用于排名系数计算"
          >
            <UInputTags v-model="awardMembersTags" class="w-full" />
          </UFormField>
          <UFormField label="佐证材料" name="evidences">
            <EvidenceUpload
              v-model="awardUploadFiles"
              :evidences="awardForm.evidences"
              @remove-evidence="removeEvidence(awardForm.evidences, $event)"
            />
          </UFormField>
        </UForm>
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton
            color="neutral"
            variant="ghost"
            label="取消"
            @click="openAward = false"
          />
          <UButton
            v-if="!selectedAward"
            :loading="savingAward"
            label="保存"
            @click="saveAward('draft')"
          />
          <UButton
            :loading="savingAward"
            label="保存并提交"
            @click="saveAward('pending')"
          />
        </div>
      </template>
    </UModal>

    <UModal v-model:open="openRecord" :title="currentRecordModalTitle">
      <template #body>
        <UForm class="space-y-4" @submit.prevent="saveRecord">
          <UAlert
            v-if="selectedRecordStatus === 'approved'"
            color="warning"
            variant="subtle"
            :title="`修改已通过的${currentRecordSectionTitle}将会重新进入待审核状态`"
          />
          <UFormField label="名称" name="name" required>
            <UInput v-model="recordForm.name" class="w-full" />
          </UFormField>
          <UFormField label="类型" name="type" required>
            <USelect
              v-model="recordForm.type"
              :items="currentRecordTypeItems"
              class="w-full"
              placeholder="请选择类型"
            />
          </UFormField>
          <UFormField label="时间" name="date" required>
            <UInput v-model="recordForm.date" class="w-full" type="date" />
          </UFormField>
          <UFormField
            label="成员排序"
            name="members"
            description="按顺序输入成员用户名，顺序用于排名系数计算"
          >
            <UInputTags v-model="recordMembersTags" class="w-full" />
          </UFormField>
          <UFormField label="佐证材料" name="evidences">
            <EvidenceUpload
              v-model="recordUploadFiles"
              :evidences="recordForm.evidences"
              @remove-evidence="removeEvidence(recordForm.evidences, $event)"
            />
          </UFormField>
        </UForm>
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton
            color="neutral"
            variant="ghost"
            label="取消"
            @click="openRecord = false"
          />
          <UButton
            v-if="!selectedRecordId"
            :loading="savingRecord"
            label="保存"
            @click="saveRecordDraft"
          />
          <UButton
            :loading="savingRecord"
            label="保存并提交"
            @click="saveRecord"
          />
        </div>
      </template>
    </UModal>
  </UContainer>
</template>
