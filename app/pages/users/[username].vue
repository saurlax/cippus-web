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
});

const openRecord = ref(false);
const savingRecord = ref(false);
const currentRecordKind = ref<RecordKind>("paper");
const selectedRecordId = ref<number>();
const recordForm = reactive({
  name: "",
  type: undefined as PaperType | PatentType | InnovationType | undefined,
  date: "",
});

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

function startEdit() {
  if (!user.value) {
    return;
  }

  form.name = user.value.name || "";
  form.bio = user.value.bio || "";
  form.email = user.value.email || "";
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
  openAward.value = true;
}

function startEditAward(award: AwardWithContest) {
  if (!canEditRecords.value) {
    return;
  }

  selectedAward.value = award;
  awardForm.contestId = award.contestId;
  awardForm.level = award.level as AwardLevel;
  awardForm.type = award.type as AwardType;
  awardForm.date = normalizeDateText(award.date);
  openAward.value = true;
}

function startRecord(
  kind: RecordKind,
  item?: PaperRecord | PatentRecord | InnovationRecord,
) {
  if (!canEditRecords.value) {
    return;
  }

  currentRecordKind.value = kind;
  selectedRecordId.value = item?.id;
  recordForm.name = item?.name || "";
  recordForm.type = (item?.type || undefined) as
    | PaperType
    | PatentType
    | InnovationType
    | undefined;
  recordForm.date = normalizeDateText(item?.date);
  openRecord.value = true;
}

async function saveProfile() {
  if (!user.value || saving.value) {
    return;
  }

  try {
    saving.value = true;
    await $fetch(`/api/users/${user.value.username}`, {
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
  } catch {
    toast.add({
      title: "更新失败",
      color: "error",
      icon: "i-lucide-circle-alert",
    });
  } finally {
    saving.value = false;
  }
}

async function saveAward() {
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

  try {
    savingAward.value = true;

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
          },
        },
      );
      toast.add({
        title: "奖项已更新，请等待审核",
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
        },
      });
      toast.add({
        title: "奖项已添加",
        color: "success",
        icon: "i-lucide-check",
      });
    }

    await refreshAwards();
    openAward.value = false;
  } catch {
    toast.add({
      title: selectedAward.value ? "更新失败" : "添加失败",
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

  const path = getRecordPath(currentRecordKind.value);

  try {
    savingRecord.value = true;

    if (selectedRecordId.value) {
      await $fetch(
        `/api/users/${username.value}/${path}/${selectedRecordId.value}`,
        {
          method: "put",
          body: {
            name: recordForm.name,
            type: recordForm.type,
            date: recordForm.date,
          },
        },
      );
      toast.add({
        title: `${currentRecordSectionTitle.value}已更新，请等待审核`,
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
        },
      });
      toast.add({
        title: `${currentRecordSectionTitle.value}已添加`,
        color: "success",
        icon: "i-lucide-check",
      });
    }

    await refreshRecordList(currentRecordKind.value);
    openRecord.value = false;
  } catch {
    toast.add({
      title: selectedRecordId.value ? "更新失败" : "添加失败",
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
          <MDC :value="user.bio || '尚无简介'" />
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
              :class="canEditRecords ? 'cursor-pointer' : ''"
              :title="award.contest?.title || '未知比赛'"
              @click="startEditAward(award)"
            >
              <template #description>
                <div class="space-y-2">
                  <p class="text-sm text-muted">
                    获奖时间：{{
                      normalizeDateText(award.date)
                    }}
                  </p>
                  <div class="flex flex-wrap gap-1">
                    <UBadge v-if="award.level">{{
                      t(`awards.level.${award.level}`)
                    }}</UBadge>
                    <UBadge v-if="award.type">{{
                      t(`awards.type.${award.type}`)
                    }}</UBadge>
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
              :class="canEditRecords ? 'cursor-pointer' : ''"
              :title="paper.name"
              @click="startRecord('paper', paper)"
            >
              <template #description>
                <div class="space-y-2">
                  <p class="text-sm text-muted">
                    时间：{{
                      normalizeDateText(paper.date)
                    }}
                  </p>
                  <div class="flex flex-wrap gap-1">
                    <UBadge>{{ t(`papers.type.${paper.type}`) }}</UBadge>
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
              :class="canEditRecords ? 'cursor-pointer' : ''"
              :title="patent.name"
              @click="startRecord('patent', patent)"
            >
              <template #description>
                <div class="space-y-2">
                  <p class="text-sm text-muted">
                    时间：{{
                      normalizeDateText(patent.date)
                    }}
                  </p>
                  <div class="flex flex-wrap gap-1">
                    <UBadge>{{ t(`patents.type.${patent.type}`) }}</UBadge>
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
              :class="canEditRecords ? 'cursor-pointer' : ''"
              :title="innovation.name"
              @click="startRecord('innovation', innovation)"
            >
              <template #description>
                <div class="space-y-2">
                  <p class="text-sm text-muted">
                    时间：{{
                      normalizeDateText(innovation.date)
                    }}
                  </p>
                  <div class="flex flex-wrap gap-1">
                    <UBadge>{{
                      t(`innovations.type.${innovation.type}`)
                    }}</UBadge>
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
        <UForm class="space-y-4" @submit.prevent="saveAward">
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
          <UButton :loading="savingAward" label="保存" @click="saveAward" />
        </div>
      </template>
    </UModal>

    <UModal v-model:open="openRecord" :title="currentRecordModalTitle">
      <template #body>
        <UForm class="space-y-4" @submit.prevent="saveRecord">
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
          <UButton :loading="savingRecord" label="保存" @click="saveRecord" />
        </div>
      </template>
    </UModal>
  </UContainer>
</template>
