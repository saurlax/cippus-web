<script setup lang="ts">
import { h, resolveComponent } from "vue";
import type { TableColumn } from "@nuxt/ui";

const route = useRoute();
const toast = useToast();
const { t } = useI18n();
const UButton = resolveComponent("UButton");

const activityId = computed(() => Number(route.params.id));

const {
  data: payload,
  status,
  refresh,
} = await useFetch<any>(
  () => `/api/admin/activities/${activityId.value}/applications`,
);

const refreshingAll = ref(false);
const refreshingApplicationId = ref<number>();
const deletingItemId = ref<number>();
const expanded = ref<Record<string, boolean>>({});

type ItemTableRow = {
  rowType: "item";
  id: number;
  parentApplicationId: number;
  rank: string;
  user: { name: string; username: string };
  totalScore: string;
  itemCount: string;
  children?: ItemTableRow[];
};

type ApplicationTableRow = {
  rowType: "application";
  id: number;
  rank: number;
  user: { name?: string; username?: string };
  totalScore: number;
  itemCount: number;
  children: ItemTableRow[];
};

type TableRow = ApplicationTableRow | ItemTableRow;

const columns: TableColumn<TableRow>[] = [
  {
    id: "tree",
    cell: ({ row }) =>
      h(
        "div",
        {
          style: {
            paddingLeft: `${row.depth}rem`,
          },
          class: "flex items-center",
        },
        [
          h(UButton, {
            color: "neutral",
            variant: "ghost",
            icon: row.getIsExpanded()
              ? "i-lucide-chevron-down"
              : "i-lucide-chevron-right",
            square: true,
            class: !row.getCanExpand() && "invisible",
            onClick: row.getToggleExpandedHandler(),
          }),
        ],
      ),
  },
  { accessorKey: "rank", header: "序号" },
  { accessorKey: "user.name", header: "姓名 / 成果" },
  { accessorKey: "user.username", header: "学号 / 类型" },
  { accessorKey: "itemCount", header: "条目数量 / 日期" },
  { accessorKey: "totalScore", header: "总分" },
  { id: "actions", header: "操作" },
];

const activity = computed(() => payload.value?.activity);
const loading = computed(
  () => status.value === "pending" || status.value === "idle",
);

function toItemRows(items: any[]) {
  return (items || []).map((item: any) => ({
    ...item,
    displayType: formatTypeLabel(item),
    achievementDate: formatDateTime(item.achievementDate),
    formula: `${item.baseScore} x ${item.multiplier} + ${item.extraScore} = ${item.finalScore}`,
  }));
}

const tableData = computed<TableRow[]>(() => {
  const applications = payload.value?.applications || [];

  return applications.map((application: any) => {
    const itemRows: ItemTableRow[] = toItemRows(application.items).map(
      (item: any) => ({
        rowType: "item",
        id: item.id,
        parentApplicationId: application.id,
        rank: "-",
        user: {
          name: item.displayName,
          username: item.displayType,
        },
        itemCount: item.achievementDate || "-",
        totalScore: item.formula,
      }),
    );

    return {
      rowType: "application",
      id: application.id,
      rank: application.rank,
      user: application.user,
      totalScore: application.totalScore,
      itemCount: application.itemCount,
      children: itemRows,
    } satisfies ApplicationTableRow;
  });
});

function formatDateTime(value: unknown): string {
  if (!value) {
    return "";
  }

  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString();
}

function formatTypeLabel(item: any): string {
  if (item.achievementType === "award") {
    const levelLabel = item.levelKey ? t(`awards.level.${item.levelKey}`) : "";
    const typeLabel = item.typeKey ? t(`awards.type.${item.typeKey}`) : "";
    return (
      [levelLabel, typeLabel].filter(Boolean).join(" + ") || item.displayType
    );
  }

  if (item.achievementType === "paper") {
    return item.typeKey ? t(`papers.type.${item.typeKey}`) : item.displayType;
  }

  if (item.achievementType === "patent") {
    return item.typeKey ? t(`patents.type.${item.typeKey}`) : item.displayType;
  }

  if (item.achievementType === "innovation") {
    return item.typeKey
      ? t(`innovations.type.${item.typeKey}`)
      : item.displayType;
  }

  return item.displayType || "";
}

async function refreshAllScores() {
  if (refreshingAll.value) return;

  try {
    refreshingAll.value = true;
    await $fetch(`/api/admin/activities/${activityId.value}/recalculate`, {
      method: "POST",
      body: {},
    });
    await refresh();
    toast.add({ title: "活动积分已重算", color: "success" });
  } catch (e: any) {
    toast.add({
      title: "重算失败",
      description: e?.data?.message || e?.message,
      color: "error",
    });
  } finally {
    refreshingAll.value = false;
  }
}

async function refreshSingleApplication(applicationId: number) {
  if (refreshingApplicationId.value) return;

  try {
    refreshingApplicationId.value = applicationId;
    await $fetch(`/api/applications/${applicationId}/recalculate`, {
      method: "POST",
      body: {},
    });
    await refresh();
    toast.add({ title: "申请积分已重算", color: "success" });
  } catch (e: any) {
    toast.add({
      title: "重算失败",
      description: e?.data?.message || e?.message,
      color: "error",
    });
  } finally {
    refreshingApplicationId.value = undefined;
  }
}

async function deleteItem(parentApplicationId: number, itemId: number) {
  if (deletingItemId.value) return;

  try {
    deletingItemId.value = itemId;
    await $fetch(`/api/applications/${parentApplicationId}/items/${itemId}`, {
      method: "DELETE",
    });
    await refresh();
    toast.add({ title: "条目已删除", color: "success" });
  } catch (e: any) {
    toast.add({
      title: "删除失败",
      description: e?.data?.message || e?.message,
      color: "error",
    });
  } finally {
    deletingItemId.value = undefined;
  }
}
</script>

<template>
  <UDashboardNavbar :title="`申报 - ${activity?.name || ''}`">
    <template #leading>
      <UButton
        to="/admin/activities"
        color="neutral"
        variant="ghost"
        icon="i-lucide-arrow-left"
      >
        返回
      </UButton>
    </template>
    <template #right>
      <UButton
        icon="i-lucide-refresh-ccw"
        :loading="refreshingAll"
        @click="refreshAllScores"
      >
        重算积分
      </UButton>
    </template>
  </UDashboardNavbar>

  <UTable
    v-model:expanded="expanded"
    :data="tableData"
    :columns="columns"
    :loading="loading"
    :get-row-id="(row: TableRow) => `${row.rowType}-${row.id}`"
    :get-sub-rows="(row: TableRow) => row.children"
    :ui="{
      base: 'border-separate border-spacing-0',
      tbody: '[&>tr]:last:[&>td]:border-b-0',
      tr: 'group',
      td: 'empty:p-0 group-has-[td:not(:empty)]:border-b border-default',
    }"
  >
    <template #rank-cell="{ row }">
      <span v-if="row.original.rowType === 'application'">
        {{ row.original.rank }}
      </span>
      <span v-else>-</span>
    </template>

    <template #itemCount-cell="{ row }">
      <span class="truncate" :title="String(row.original.itemCount)">
        {{ row.original.itemCount }}
      </span>
    </template>

    <template #actions-cell="{ row }">
      <UButton
        v-if="row.original.rowType === 'application'"
        icon="i-lucide-refresh-ccw"
        size="sm"
        color="neutral"
        variant="ghost"
        :loading="refreshingApplicationId === row.original.id"
        @click="refreshSingleApplication(row.original.id)"
      />
      <UButton
        v-if="row.original.rowType === 'item'"
        icon="i-lucide-trash-2"
        size="xs"
        color="error"
        variant="ghost"
        :loading="deletingItemId === row.original.id"
        @click="deleteItem(row.original.parentApplicationId, row.original.id)"
      />
    </template>
  </UTable>
</template>
