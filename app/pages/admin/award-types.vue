<script setup lang="ts">
const UButton = resolveComponent("UButton");

const { data: awardTypes } = await useFetch<any>("/api/admin/award-types");

const columns = [
  { accessorKey: "id", header: "#" },
  { accessorKey: "name", header: "类型名称" },
  {
    id: "actions",
    cell: ({ row }: any) => {
      const item = row.original;

      const remove = async () => {
        await $fetch(`/api/admin/award-types/${item.id}`, {
          method: "delete",
        });
        awardTypes.value = await $fetch("/api/admin/award-types");
      };

      return h("div", { class: "flex gap-2" }, [
        h(UButton, {
          icon: "i-lucide-pencil",
          color: "neutral",
          variant: "ghost",
          onClick: () => {
            currentAwardType.value = { id: item.id, name: item.name };
            openModal.value = true;
          },
        }),
        h(UButton, {
          icon: "i-lucide-trash",
          color: "error",
          variant: "ghost",
          onClick: remove,
        }),
      ]);
    },
  },
];

const openModal = ref(false);
const currentAwardType = ref<any>({
  name: "",
});

function createAwardType() {
  currentAwardType.value = {
    name: "",
  };
  openModal.value = true;
}

async function updateAwardType() {
  const item = currentAwardType.value;
  if (!item?.name?.trim()) {
    return;
  }

  if (item.id) {
    await $fetch(`/api/admin/award-types/${item.id}`, {
      method: "put",
      body: { name: item.name },
    });
  } else {
    await $fetch(`/api/admin/award-types`, {
      method: "post",
      body: { name: item.name },
    });
  }

  awardTypes.value = await $fetch("/api/admin/award-types");
  openModal.value = false;
}
</script>

<template>
  <UDashboardNavbar title="奖项类型管理">
    <template #right>
      <UButton @click="createAwardType">新建类型</UButton>
    </template>
  </UDashboardNavbar>

  <UTable :data="awardTypes" :columns />

  <UModal v-model:open="openModal" title="编辑奖项类型">
    <template #body>
      <UForm class="flex flex-col gap-2" @submit.prevent="updateAwardType">
        <UFormField label="类型名称" name="name" required>
          <UInput
            class="w-full"
            v-model="currentAwardType.name"
            placeholder="请输入奖项类型名称"
          />
        </UFormField>
      </UForm>
    </template>
    <template #footer>
      <UButton @click="updateAwardType">保存</UButton>
    </template>
  </UModal>
</template>
