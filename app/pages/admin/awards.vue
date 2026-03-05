<script setup lang="ts">
const UDropdownMenu = resolveComponent("UDropdownMenu");
const UButton = resolveComponent("UButton");

const { awardLevels, awardTypes, awardLevelItems, awardTypeItems } = useAwards();

const { data: awards } = await useFetch<any>("/api/admin/awards");
const columns = [
  { accessorKey: "id", header: "#" },
  { accessorKey: "user.username", header: "用户" },
  { accessorKey: "contest.title", header: "比赛" },
  {
    accessorKey: "level",
    header: "级别",
    cell: ({ row }: any) => {
      return awardLevels[(row.original.level as keyof typeof awardLevels)] || row.original.level;
    },
  },
  {
    accessorKey: "type",
    header: "类型",
    cell: ({ row }: any) => {
      return awardTypes[(row.original.type as keyof typeof awardTypes)] || row.original.type;
    },
  },
  { accessorKey: "status", header: "状态" },
  { accessorKey: "updatedAt", header: "更新时间" },
  {
    id: "actions",
    cell: ({ row }: any) => {
      const item = row.original;
      const approve = async () => {
        await $fetch(`/api/admin/awards/${item.id}`, {
          method: "put",
          body: { status: "approved" },
        });
        awards.value = await $fetch("/api/admin/awards");
      };
      const reject = async () => {
        await $fetch(`/api/admin/awards/${item.id}`, {
          method: "put",
          body: { status: "rejected" },
        });
        awards.value = await $fetch("/api/admin/awards");
      };
      return h("div", { class: "flex items-center gap-1" }, [
        h(UButton, {
          color: "success",
          icon: "i-lucide-check",
          variant: "ghost",
          onClick: approve,
        }),
        h(UButton, {
          color: "error",
          icon: "i-lucide-x",
          variant: "ghost",
          onClick: reject,
        }),
        h(
          UDropdownMenu,
          {
            items: [
              {
                label: "编辑奖项",
                onClick: () => {
                  currentAward.value = item;
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
          },
        ),
      ]);
    },
  },
];
const openModal = ref(false);

const currentAward = ref<any>({});

async function editAward() {
  // reuse same modal? could implement simple update
  if (currentAward.value) {
    const body = { ...currentAward.value };
    // send to admin put
    await $fetch(`/api/admin/awards/${body.id}`, { method: "put", body });
    openModal.value = false;
    awards.value = await $fetch("/api/admin/awards");
  }
}
</script>

<template>
  <UDashboardNavbar title="奖项管理">
    <template #right>
      <!-- no create button for now -->
    </template>
  </UDashboardNavbar>
  <UTable :data="awards" :columns />

  <UModal v-model:open="openModal" title="编辑奖项">
    <template #body>
      <UForm class="flex flex-col gap-2" @submit.prevent="editAward">
        <UFormField label="级别" name="level">
          <USelect
            class="w-full"
            v-model="currentAward.level"
            :items="awardLevelItems"
          />
        </UFormField>
        <UFormField label="类型" name="type">
          <USelect
            class="w-full"
            v-model="currentAward.type"
            :items="awardTypeItems"
          />
        </UFormField>
        <UFormField label="状态" name="status">
          <USelect
            class="w-full"
            v-model="currentAward.status"
            :items="[
              { label: '草稿', value: 'draft' },
              { label: '待审核', value: 'pending' },
              { label: '通过', value: 'approved' },
              { label: '拒绝', value: 'rejected' },
            ]"
          />
        </UFormField>
      </UForm>
    </template>
    <template #footer>
      <UButton @click="editAward">保存</UButton>
    </template>
  </UModal>
</template>
