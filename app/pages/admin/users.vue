<script setup lang="ts">
const UButton = resolveComponent("UButton");

const { data: users } = await useFetch("/api/admin/users");
const columns = [
  { accessorKey: "id", header: "#" },
  { accessorKey: "username", header: "用户" },
  { accessorKey: "name", header: "姓名" },
  { accessorKey: "email", header: "邮箱" },
  { accessorKey: "gender", header: "性别" },
  { accessorKey: "college", header: "学院" },
  {
    accessorKey: "admin",
    header: "管理",
    cell: ({ row }: any) => {
      return row.original.admin ? "是" : "否";
    },
  },
  {
    id: "actions",
    cell: ({ row }: any) => {
      return h(UButton, {
        icon: "i-lucide-pencil",
        color: "neutral",
        variant: "ghost",
        onClick: () => {
          currentUser.value = row.original;
          openModal.value = true;
        },
      });
    },
  },
];
const openModal = ref(false);
const genderItems = ref([
  { label: "男", value: "male" },
  { label: "女", value: "female" },
]);
const currentUser = ref<any>({
  username: "",
  password: "",
  name: "",
  email: "",
  gender: "",
  college: "",
  admin: false,
});

function createUser() {
  openModal.value = true;
  currentUser.value = {
    username: "",
    password: "",
    name: "",
    email: "",
    gender: "male",
    college: "",
    admin: false,
  };
}

async function updateUser() {
  const user = currentUser.value;
  if (user) {
    if (user.id) {
      await $fetch<any>(`/api/admin/users/${user.id}`, {
        method: "PUT",
        body: user,
      });
    } else {
      await $fetch<any>(`/api/admin/users`, {
        method: "POST",
        body: user,
      });
    }
  }
  users.value = await $fetch<any>("/api/admin/users");
  openModal.value = false;
}
</script>

<template>
  <UDashboardNavbar title="用户管理">
    <template #right>
      <UButton @click="createUser">新建用户</UButton>
    </template>
  </UDashboardNavbar>
  <UTable :data="users" :columns />
  <UModal v-model:open="openModal" title="编辑用户">
    <template #body>
      <UForm class="flex flex-col gap-2" @submit="updateUser">
        <UFormField label="用户" name="username" required>
          <UInput
            class="w-full"
            v-model="currentUser.username"
            placeholder="请输入用户名"
          />
        </UFormField>
        <UFormField label="密码" name="password">
          <UInput
            class="w-full"
            type="password"
            v-model="currentUser.password"
            placeholder="请输入密码"
          />
        </UFormField>
        <UFormField label="姓名" name="name">
          <UInput
            class="w-full"
            v-model="currentUser.name"
            placeholder="请输入姓名"
          />
        </UFormField>
        <UFormField label="邮箱" name="email">
          <UInput
            class="w-full"
            type="email"
            v-model="currentUser.email"
            placeholder="请输入邮箱"
          />
        </UFormField>
        <UFormField label="性别" name="gender">
          <USelect
            class="w-full"
            v-model="currentUser.gender"
            :items="genderItems"
            placeholder="请选择性别"
          />
        </UFormField>
        <UFormField label="学院" name="college">
          <UInput
            class="w-full"
            v-model="currentUser.college"
            placeholder="请输入学院"
          />
        </UFormField>
        <UFormField label="管理" name="admin">
          <UCheckbox v-model="currentUser.admin" label="设为管理员" />
        </UFormField>
      </UForm>
    </template>
    <template #footer>
      <UButton @click="updateUser">提交</UButton>
    </template>
  </UModal>
</template>
