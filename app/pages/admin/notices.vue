<script setup lang="ts">
import type { Database } from "~/types/database.types";

const UDropdownMenu = resolveComponent("UDropdownMenu");
const UButton = resolveComponent("UButton");

definePageMeta({
  layout: "admin",
});

type Notice = {
  id?: number;
  title: string;
  category: string | null;
  content: string;
  createdAt: string | null;
  updatedAt: string | null;
};

const supabase = useSupabaseClient<Database>();
const toast = useToast();

const emptyNotice = (): Notice => ({
  title: "",
  category: "",
  content: "",
  createdAt: null,
  updatedAt: null,
});

const { data: notices, refresh: refreshNotices } =
  await useAsyncData<Notice[]>("admin-notices", async () => {
    const { data, error } = await supabase
      .from("notices")
      .select("id, title, category, content, created_at, updated_at")
      .order("id", { ascending: false });

    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message });
    }

    return (data ?? []).map((notice) => ({
      id: notice.id,
      title: notice.title,
      category: notice.category,
      content: notice.content,
      createdAt: notice.created_at,
      updatedAt: notice.updated_at,
    }));
  });

const columns = [
  { accessorKey: "id", header: "#" },
  { accessorKey: "title", header: "标题" },
  { accessorKey: "category", header: "分类" },
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
              label: "编辑公告",
              onClick: () => {
                currentNotice.value = { ...row.original };
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
const currentNotice = ref<Notice>(emptyNotice());

function createNotice() {
  currentNotice.value = emptyNotice();
  openModal.value = true;
}

async function updateNotice() {
  const notice = currentNotice.value;
  if (!notice) return;

  const payload = {
    title: notice.title,
    category: notice.category,
    content: notice.content,
    updated_at: new Date().toISOString(),
  } satisfies Database["public"]["Tables"]["notices"]["Insert"];

  const { error } = notice.id
    ? await supabase.from("notices").update(payload).eq("id", notice.id)
    : await supabase.from("notices").insert([payload]);

  if (error) {
    toast.add({ title: error.message, color: "error" });
    return;
  }

  await refreshNotices();
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
  <UModal v-model:open="openModal" title="编辑公告">
    <template #body>
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
      </UForm>
    </template>
    <template #footer>
      <UButton @click="updateNotice">提交</UButton>
    </template>
  </UModal>
</template>
