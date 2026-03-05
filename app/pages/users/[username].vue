<script setup lang="ts">
const route = useRoute();
const { user: sessionUser } = useUserSession();
const toast = useToast();

const username = computed(() => String(route.params.username || ""));
const { data: user, refresh } = await useFetch(
  () => `/api/users/${username.value}`,
);

if (!user.value) {
  throw createError({ statusCode: 404 });
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

    await refresh();
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
</script>

<template>
  <UContainer v-if="user">
    <UPageHeader headline="用户" :description="user.college || '未知学院'">
      <template #title>
        <div class="flex items-center gap-2">
          <span>{{ user.name || user.username }}</span>
          <UIcon :name="genderIcon.name" :class="genderIcon.class" />
        </div>
      </template>

      <template #links>
        <UButton
          v-if="sessionUser && sessionUser.username === user.username"
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
          <div class="prose">
            <MDC :value="user.bio || '尚无简介'" />
          </div>
        </UPageCard>

        <UPageCard title="奖项">
          <UEmpty title="暂无奖项" />
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
  </UContainer>
</template>
