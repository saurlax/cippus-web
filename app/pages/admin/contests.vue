<script setup lang="ts">
import type { Contest } from "@prisma/client";
const UDropdownMenu = resolveComponent("UDropdownMenu");
const UButton = resolveComponent("UButton");

definePageMeta({
  layout: "admin",
});

const { data: contests } = await useFetch("/api/admin/contests");
const columns = [
  { accessorKey: "id", header: "#" },
  { accessorKey: "title", header: "标题" },
  { accessorKey: "description", header: "描述" },
  { accessorKey: "startTime", header: "开始时间" },
  { accessorKey: "endTime", header: "结束时间" },
  { accessorKey: "createdAt", header: "创建时间" },
  { accessorKey: "updatedAt", header: "更新时间" },
  {
    id: "actions",
    cell: ({ row }: any) => {
      return h(
        UDropdownMenu,
        {
          items: [
            {
              label: "编辑赛事",
              onClick: () => {
                currentContest.value = row.original;
                openModal.value = true;
              },
            },
          ],
        },
        () => {
          return h(UButton, {
            icon: "i-lucide-ellipsis-vertical",
            color: "neutral",
            variant: "ghost",
          });
        }
      );
    },
  },
];
const openModal = ref(false);
const currentContest = ref<Partial<Contest>>({
  title: "",
  description: "",
  startTime: new Date(),
  endTime: new Date(),
});

function createContest() {
  openModal.value = true;
  currentContest.value = {
    title: "",
    description: "",
    startTime: new Date(),
    endTime: new Date(),
  };
}

async function updateContest() {
  const contest = currentContest.value;
  if (contest) {
    if (contest.id) {
      await $fetch<any>(`/api/admin/contests/${contest.id}`, {
        method: "PUT",
        body: contest,
      });
    } else {
      await $fetch<any>(`/api/admin/contests`, {
        method: "POST",
        body: contest,
      });
    }
  }
  contests.value = await $fetch<any>("/api/admin/contests");
  openModal.value = false;
}
</script>

<template>
  <UDashboardNavbar title="赛事管理">
    <template #right>
      <UButton @click="createContest">新建赛事</UButton>
    </template>
  </UDashboardNavbar>
  <UTable :data="contests" :columns />
  <UModal v-model:open="openModal" title="编辑赛事">
    <template #body>
      <UForm class="flex flex-col gap-2" @submit="updateContest">
        <UFormField label="标题" name="title" required>
          <UInput
            class="w-full"
            v-model="currentContest.title"
            placeholder="请输入赛事标题"
          />
        </UFormField>
        <UFormField label="描述" name="description">
          <UTextarea
            class="w-full"
            v-model="currentContest.description"
            placeholder="请输入赛事描述"
          />
        </UFormField>
        <UFormField label="开始时间" name="startTime" required>
          <UInput
            class="w-full"
            type="date"
            v-model="currentContest.startTime as any"
          />
        </UFormField>
        <UFormField label="结束时间" name="endTime" required>
          <UInput
            class="w-full"
            type="date"
            v-model="currentContest.endTime as any"
          />
        </UFormField>
      </UForm>
    </template>
    <template #footer>
      <UButton @click="updateContest">提交</UButton>
    </template>
  </UModal>
</template>
