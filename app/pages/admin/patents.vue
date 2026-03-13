<script setup lang="ts">
const UButton = resolveComponent("UButton");

const { t } = useI18n();

const { data: patents, refresh } = await useFetch<any[]>("/api/admin/patents");

function formatDateText(value: unknown) {
  if (!value || typeof value !== "string") {
    return "";
  }

  return value.slice(0, 10);
}

const typeItems = patentTypeValues.map((value) => ({
  value,
  label: t(`patents.type.${value}`),
}));
const statusItems = reviewStatusValues.map((value) => ({
  value,
  label: t(`awards.status.${value}`),
}));

const columns = [
  { accessorKey: "id", header: "#" },
  { accessorKey: "user.username", header: "用户" },
  { accessorKey: "name", header: "名称" },
  {
    accessorKey: "type",
    header: "类型",
    cell: ({ row }: any) => t(`patents.type.${row.original.type}`),
  },
  {
    accessorKey: "date",
    header: "时间",
    cell: ({ row }: any) => formatDateText(row.original.date),
  },
  {
    accessorKey: "status",
    header: "状态",
    cell: ({ row }: any) => t(`awards.status.${row.original.status}`),
  },
  {
    accessorKey: "updatedAt",
    header: "更新时间",
    cell: ({ row }: any) => formatDateText(row.original.updatedAt),
  },
  {
    id: "actions",
    cell: ({ row }: any) => {
      const item = row.original;

      const approve = async () => {
        await $fetch(`/api/admin/patents/${item.id}`, {
          method: "put",
          body: { status: "approved" },
        });
        await refresh();
      };

      const reject = async () => {
        await $fetch(`/api/admin/patents/${item.id}`, {
          method: "put",
          body: { status: "rejected" },
        });
        await refresh();
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
            currentPatent.value = {
              id: item.id,
              name: item.name,
              type: item.type,
              date: formatDateText(item.date),
              status: item.status,
            };
            openModal.value = true;
          },
        }),
      ]);
    },
  },
];

const openModal = ref(false);
const currentPatent = ref<any>({});

async function editPatent() {
  if (!currentPatent.value?.id) {
    return;
  }

  await $fetch(`/api/admin/patents/${currentPatent.value.id}`, {
    method: "put",
    body: {
      name: currentPatent.value.name,
      type: currentPatent.value.type,
      date: currentPatent.value.date,
      status: currentPatent.value.status,
    },
  });

  openModal.value = false;
  await refresh();
}
</script>

<template>
  <UDashboardNavbar title="专利管理"></UDashboardNavbar>
  <UTable :data="patents" :columns />

  <UModal v-model:open="openModal" title="编辑专利">
    <template #body>
      <UForm class="flex flex-col gap-2" @submit.prevent="editPatent">
        <UFormField label="名称" name="name" required>
          <UInput v-model="currentPatent.name" class="w-full" />
        </UFormField>
        <UFormField label="类型" name="type" required>
          <USelect
            v-model="currentPatent.type"
            class="w-full"
            :items="typeItems as any"
          />
        </UFormField>
        <UFormField label="时间" name="date" required>
          <UInput v-model="currentPatent.date" class="w-full" type="date" />
        </UFormField>
        <UFormField label="状态" name="status" required>
          <USelect
            v-model="currentPatent.status"
            class="w-full"
            :items="statusItems as any"
          />
        </UFormField>
      </UForm>
    </template>
    <template #footer>
      <UButton @click="editPatent">保存</UButton>
    </template>
  </UModal>
</template>
