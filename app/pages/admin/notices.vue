<script setup lang="ts">
import type { Notice } from "@prisma/client";
const UButton = resolveComponent("UButton");

definePageMeta({
  layout: "admin",
});

const { data: notices } = await useFetch("/api/admin/notices");
const columns = [
  { accessorKey: "id", header: "#" },
  { accessorKey: "title", header: "标题" },
  { accessorKey: "category", header: "分类" },
  { accessorKey: "createdAt", header: "创建时间" },
  { accessorKey: "updatedAt", header: "更新时间" },
  {
    accessorKey: "id",
    cell: ({ row }) => {
      return h(UButton);
    },
  },
];
const openModal = ref(false);
const currentNotice = ref<Partial<Notice>>({
  title: "",
  category: "",
  content: "",
});

function createNotice() {
  openModal.value = true;
  currentNotice.value = {
    title: "",
    category: "",
    content: "",
  };
}

async function updateNotice() {
  const notice = currentNotice.value;
  if (notice) {
    if (notice.id) {
      notices.value?.push(
        await $fetch<any>(`/api/admin/notices/${notice.id}`, {
          method: "PUT",
          body: notice,
        })
      );
    } else {
      notices.value?.push(
        await $fetch<any>(`/api/admin/notices`, {
          method: "POST",
          body: notice,
        })
      );
    }
  }
  openModal.value = false;
}
</script>

<template>
  <UDashboardNavbar title="公告管理">
    <template #right>
      <UButton @click="createNotice">新建公告</UButton>
    </template>
  </UDashboardNavbar>
  <UTable :data="notices" :columns />
  <UModal :open="openModal" title="编辑公告">
    <template #content>
      <UForm class="flex flex-col gap-2" @submit="updateNotice">
        <UFormField label="标题" name="title" required>
          <UInput
            class="w-full"
            v-model="currentNotice.title"
            placeholder="请输入公告标题"
          />
        </UFormField>
        <UFormField label="分类" name="category">
          <UInput
            class="w-full"
            v-model="currentNotice.category"
            placeholder="请输入公告分类"
          />
        </UFormField>
        <UFormField label="内容" name="content" required>
          <UTextarea
            class="w-full"
            v-model="currentNotice.content"
            placeholder="请输入公告内容"
          />
        </UFormField>
        <UFormField>
          <UButton type="submit" color="primary">提交</UButton>
        </UFormField>
      </UForm>
    </template>
  </UModal>
</template>
