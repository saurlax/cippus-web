<script setup lang="ts">
const UButton = resolveComponent("UButton");

const { t } = useI18n();

const { data: awards } = await useFetch<any>("/api/admin/awards");

const levelItems = awardLevelValues.map((v) => ({
  value: v,
  label: t(`awards.level.${v}`),
}));
const typeItems = awardTypeValues.map((v) => ({
  value: v,
  label: t(`awards.type.${v}`),
}));
const statusItems = ["draft", "pending", "approved", "rejected"].map((v) => ({
  value: v,
  label: t(`awards.status.${v}`),
}));

const columns = [
  { accessorKey: "id", header: "#" },
  { accessorKey: "user.username", header: "用户" },
  { accessorKey: "contest.title", header: "比赛" },
  {
    accessorKey: "level",
    header: "级别",
    cell: ({ row }: any) => t(`awards.level.${row.original.level}`),
  },
  {
    accessorKey: "type",
    header: "类型",
    cell: ({ row }: any) => t(`awards.type.${row.original.type}`),
  },
  {
    accessorKey: "status",
    header: "状态",
    cell: ({ row }: any) => t(`awards.status.${row.original.status}`),
  },
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
        h(UButton, {
          color: "neutral",
          icon: "i-lucide-pencil",
          variant: "ghost",
          onClick: () => {
            currentAward.value = {
              id: item.id,
              status: item.status,
              level: item.level,
              type: item.type,
            };
            openModal.value = true;
          },
        }),
      ]);
    },
  },
];
const openModal = ref(false);

const currentAward = ref<any>({});

async function editAward() {
  if (currentAward.value?.id) {
    await $fetch(`/api/admin/awards/${currentAward.value.id}`, {
      method: "put",
      body: {
        status: currentAward.value.status,
        level: currentAward.value.level,
        type: currentAward.value.type,
      },
    });
    openModal.value = false;
    awards.value = await $fetch("/api/admin/awards");
  }
}
</script>

<template>
  <UDashboardNavbar title="奖项管理"></UDashboardNavbar>
  <UTable :data="awards" :columns />

  <UModal v-model:open="openModal" title="编辑奖项">
    <template #body>
      <UForm class="flex flex-col gap-2" @submit.prevent="editAward">
        <UFormField label="级别" name="level">
          <USelect
            class="w-full"
            v-model="currentAward.level"
            :items="levelItems as any"
          />
        </UFormField>
        <UFormField label="类型" name="type">
          <USelect
            class="w-full"
            v-model="currentAward.type"
            :items="typeItems as any"
          />
        </UFormField>
        <UFormField label="状态" name="status">
          <USelect
            class="w-full"
            v-model="currentAward.status"
            :items="statusItems as any"
          />
        </UFormField>
      </UForm>
    </template>
    <template #footer>
      <UButton @click="editAward">保存</UButton>
    </template>
  </UModal>
</template>
