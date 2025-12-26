<script setup lang="ts">
import type { Database } from "~/types/database.types";

const UDropdownMenu = resolveComponent("UDropdownMenu");
const UButton = resolveComponent("UButton");

definePageMeta({
  layout: "admin",
});

type Contest = {
  id?: number;
  title: string;
  description: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

const supabase = useSupabaseClient<Database>();
const toast = useToast();

const emptyContest = (): Contest => ({
  title: "",
  description: "",
  createdAt: null,
  updatedAt: null,
});

const { data: contests, refresh: refreshContests } =
  await useAsyncData<Contest[]>("admin-contests", async () => {
    const { data, error } = await supabase
      .from("contests")
      .select("id, title, description, created_at, updated_at")
      .order("id", { ascending: false });

    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message });
    }

    return (data ?? []).map((contest) => ({
      id: contest.id,
      title: contest.title,
      description: contest.description,
      createdAt: contest.created_at,
      updatedAt: contest.updated_at,
    }));
  });

const columns = [
  { accessorKey: "id", header: "#" },
  { accessorKey: "title", header: "标题" },
  { accessorKey: "description", header: "描述" },
  { accessorKey: "createdAt", header: "创建时间" },
  { accessorKey: "updatedAt", header: "更新时间" },
  {
    id: "actions",
    cell: ({ row }: any) =>
      h(
        UDropdownMenu,
        {
          items: [
            {
              label: "编辑赛事",
              onClick: () => {
                currentContest.value = { ...row.original };
                openModal.value = true;
              },
            },
          ],
        },
        () =>
          h(UButton, {
            icon: "i-lucide-ellipsis-vertical",
            color: "neutral",
            variant: "ghost",
          })
      ),
  },
];

const openModal = ref(false);
const currentContest = ref<Contest>(emptyContest());

function createContest() {
  currentContest.value = emptyContest();
  openModal.value = true;
}

async function updateContest() {
  const contest = currentContest.value;
  if (!contest) return;

  const payload = {
    title: contest.title,
    description: contest.description,
    updated_at: new Date().toISOString(),
  } satisfies Database["public"]["Tables"]["contests"]["Insert"];

  const { error } = contest.id
    ? await supabase.from("contests").update(payload).eq("id", contest.id)
    : await supabase.from("contests").insert([payload]);

  if (error) {
    toast.add({ title: error.message, color: "error" });
    return;
  }

  await refreshContests();
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
      </UForm>
    </template>
    <template #footer>
      <UButton @click="updateContest">提交</UButton>
    </template>
  </UModal>
</template>
