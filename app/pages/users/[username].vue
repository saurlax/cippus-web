<script setup lang="ts">
const route = useRoute();
const { user: sessionUser } = useUserSession();
const toast = useToast();
const { t } = useI18n();

const username = computed(() => String(route.params.username || ""));
const isSelf = computed(() => sessionUser.value?.username === username.value);

const { data: user, refresh: refreshUser } = await useFetch(
  `/api/users/${username.value}`,
);
const { data: awards, refresh: refreshAwards } = await useFetch(
  `/api/users/${username.value}/awards`,
);

type AwardWithContest = NonNullable<typeof awards.value>[number];

const { data: contests } = await useFetch("/api/contests");

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
const awardForm = reactive({
  contestId: undefined as number | undefined,
  level: undefined as AwardLevel | undefined,
  type: undefined as AwardType | undefined,
});

const selectedAward = ref<AwardWithContest>();

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

const contestItems = computed(() =>
  (contests.value || []).map((c: any) => ({
    label: c.title,
    value: c.id,
  })),
);
const levelItems = awardLevelValues.map((v) => ({
  value: v,
  label: t(`awards.level.${v}`),
}));
const typeItems = awardTypeValues.map((v) => ({
  value: v,
  label: t(`awards.type.${v}`),
}));

const awardsList = computed(() => awards.value || []);

const genderItems = ref([
  { label: "男", value: "male" },
  { label: "女", value: "female" },
]);

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
  openAward.value = true;
}

function startEditAward(a: AwardWithContest) {
  selectedAward.value = a;
  awardForm.contestId = a.contestId;
  awardForm.level = a.level as AwardLevel;
  awardForm.type = a.type as AwardType;
  openAward.value = true;
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
      title: "Profile updated",
      color: "success",
      icon: "i-lucide-check",
    });
  } catch {
    toast.add({
      title: "Update failed",
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
  try {
    savingAward.value = true;
    if (selectedAward.value) {
      await $fetch(
        `/api/users/${username.value}/awards/${selectedAward.value.id}`,
        {
          method: "put" as any,
          body: {
            contestId: awardForm.contestId,
            level: awardForm.level,
            type: awardForm.type,
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
              class="cursor-pointer"
              icon="i-lucide-plus"
              description="添加奖项"
              hightlight
              spotlight
              @click="startAddAward"
            />
            <UPageCard
              v-for="award in awardsList"
              :key="award.id"
              class="cursor-pointer"
              :title="award.contest?.title || '未知比赛'"
              @click="startEditAward(award)"
            >
              <template #description>
                <div class="flex flex-wrap gap-1">
                  <UBadge v-if="award.level">{{ t(`awards.level.${award.level}`) }}</UBadge>
                  <UBadge v-if="award.type">{{ t(`awards.type.${award.type}`) }}</UBadge>
                  <UBadge :color="statusColor(award.status)" variant="outline">
                    {{ t(`awards.status.${award.status}`) || award.status }}
                  </UBadge>
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
          <UFormField label="比赛" name="contestId">
            <USelect
              v-model="awardForm.contestId"
              :items="contestItems"
              class="w-full"
              placeholder="请选择比赛"
            />
          </UFormField>
          <UFormField label="级别" name="level">
            <USelect
              v-model="awardForm.level"
              :items="levelItems"
              class="w-full"
              placeholder="请选择级别"
            />
          </UFormField>
          <UFormField label="类型" name="type">
            <USelect
              v-model="awardForm.type"
              :items="typeItems"
              class="w-full"
              placeholder="请选择类型"
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
          <UButton :loading="savingAward" label="保存" @click="saveAward" />
        </div>
      </template>
    </UModal>
  </UContainer>
</template>
