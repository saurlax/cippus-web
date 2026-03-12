<script setup lang="ts">
const UDropdownMenu = resolveComponent("UDropdownMenu");
const UButton = resolveComponent("UButton");

const { t } = useI18n();

const { data: awards } = await useFetch<any>("/api/admin/awards");
const { data: awardTypes } = await useFetch<any>("/api/award-types");
const awardTypeItems = computed(() =>
  (awardTypes.value || []).map((item: any) => ({
    value: item.id,
    label: item.name,
  })),
);
const columns = [
  { accessorKey: "id", header: "#" },
  { accessorKey: "user.username", header: "用户" },
  { accessorKey: "contest.title", header: "比赛" },
  {
    accessorKey: "type",
    header: "类型",
    cell: ({ row }: any) => {
      return row.original.awardType?.name || "-";
    },
  },
  {
    accessorKey: "status",
    header: "状态",
    cell: ({ row }: any) => {
      const st = row.original.status;
      return t(`awards.status.${st}`) || st;
    },
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
        h(
          UDropdownMenu,
          {
            items: [
              {
                label: "编辑奖项",
                onClick: () => {
                  currentAward.value = {
                    id: item.id,
                    status: item.status,
                    awardTypeId: item.awardTypeId,
                  };
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
  if (currentAward.value?.id) {
    await $fetch(`/api/admin/awards/${currentAward.value.id}`, {
      method: "put",
      body: {
        status: currentAward.value.status,
        awardTypeId: currentAward.value.awardTypeId,
      },
    });
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
        <UFormField label="类型" name="type">
          <USelect
            class="w-full"
            v-model="currentAward.awardTypeId"
            :items="awardTypeItems as any"
          />
        </UFormField>
        <UFormField label="状态" name="status">
          <USelect
            class="w-full"
            v-model="currentAward.status"
            :items="
              [
                { label: t('awards.status.draft'), value: 'draft' },
                { label: t('awards.status.pending'), value: 'pending' },
                { label: t('awards.status.approved'), value: 'approved' },
                { label: t('awards.status.rejected'), value: 'rejected' },
              ] as any
            "
          />
        </UFormField>
      </UForm>
    </template>
    <template #footer>
      <UButton @click="editAward">保存</UButton>
    </template>
  </UModal>
</template>
