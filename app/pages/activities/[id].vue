<script setup lang="ts">
import { h, resolveComponent } from "vue";
import type { TableColumn } from "@nuxt/ui";

const route = useRoute();
const toast = useToast();
const { t } = useI18n();
const { loggedIn } = useUserSession();
const UButton = resolveComponent("UButton");
const ULinkComponent = resolveComponent("ULink");

const activityId = computed(() => Number(route.params.id));
const applicationsApiPath = computed(
  () => `/api/activities/${activityId.value}/applications` as string,
);

const { data: activity, status: activityStatus } = await useFetch<any>(
  () => `/api/activities/${activityId.value}`,
);
const { data: contests } = await useFetch<any[]>("/api/contests");

const {
  data: payload,
  status,
  refresh,
} = await useAsyncData<any>(
  () => {
    if (!loggedIn.value) {
      return Promise.resolve({ applications: [] });
    }

    return $fetch<any>(applicationsApiPath.value);
  },
  {
    watch: [loggedIn, activityId],
    default: () => ({ applications: [] }),
  },
);

const expanded = ref<Record<string, boolean>>({});
const creatingApplication = ref(false);
const addModalOpen = ref(false);
const addingItem = ref(false);
const deletingItemId = ref<number>();
const targetApplicationId = ref<number>();
const selectedAchievementType = ref<
  "award" | "paper" | "patent" | "innovation"
>("award");
const selectedAchievementId = ref<number>();
const activeRuleTab = ref<string>("");
const hasHandledInitialRuleTabUpdate = ref(false);

const achievementPayload = ref<any>();
const loadingAchievements = ref(false);

type ItemTableRow = {
  rowType: "item";
  id: number;
  parentApplicationId: number;
  rank: string;
  user: { name: string; username: string };
  totalScore: string;
  itemCount: string;
  canManage: boolean;
  children?: ItemTableRow[];
};

type ApplicationTableRow = {
  rowType: "application";
  id: number;
  rank: number;
  isCurrentUser: boolean;
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

const loading = computed(() =>
  loggedIn.value
    ? status.value === "pending" || status.value === "idle"
    : false,
);
const pageLoading = computed(() => activityStatus.value === "pending");
const applications = computed(() => payload.value?.applications || []);
const tableData = computed<TableRow[]>(() => {
  return applications.value.map((application: any) => {
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
        canManage: !!application.isCurrentUser,
      }),
    );

    return {
      rowType: "application",
      id: application.id,
      rank: application.rank,
      isCurrentUser: !!application.isCurrentUser,
      user: application.user,
      totalScore: application.totalScore,
      itemCount: application.itemCount,
      children: itemRows,
    } satisfies ApplicationTableRow;
  });
});
const ownApplication = computed(() =>
  applications.value.find((item: any) => item.isCurrentUser),
);
const hasOwnApplication = computed(() => !!ownApplication.value);
const contestNameMap = computed(() => {
  const map = new Map<string, string>();
  for (const contest of contests.value || []) {
    map.set(String(contest.id), String(contest.title || `赛事 #${contest.id}`));
  }
  return map;
});

const achievementTypeItems = [
  { label: "奖项", value: "award" },
  { label: "论文", value: "paper" },
  { label: "专利", value: "patent" },
  { label: "大创", value: "innovation" },
];

const achievementOptions = computed(() => {
  if (!achievementPayload.value) return [];

  const typeKey = `${selectedAchievementType.value}s`;
  const list = achievementPayload.value[typeKey] || [];

  return list.map((item: any) => ({
    label: `${item.label} (${formatCandidateType(item)}) · ${formatDateTime(item.date)}`,
    value: item.id,
    disabled: !!item.selected,
  }));
});

type AwardRuleRow = {
  level: string;
  type: string;
  value: string;
  numericValue: number;
};

type TypeRuleRow = {
  type: string;
  value: string;
  numericValue: number;
};

type ContestRuleRow = {
  contestId: string;
  contestName: string;
  level: string;
  value: string;
  numericValue: number;
};

function toNumberOrNegativeInfinity(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NEGATIVE_INFINITY;
}

function sortRuleRowsByValueDesc<T extends { numericValue: number }>(
  rows: T[],
): T[] {
  return [...rows].sort((a, b) => b.numericValue - a.numericValue);
}

const awardRuleColumns: TableColumn<AwardRuleRow>[] = [
  { accessorKey: "level", header: "级别" },
  { accessorKey: "type", header: "类型" },
  { accessorKey: "value", header: "积分" },
];

const typeRuleColumns: TableColumn<TypeRuleRow>[] = [
  { accessorKey: "type", header: "类型" },
  { accessorKey: "value", header: "积分" },
];

const contestRuleColumns: TableColumn<ContestRuleRow>[] = [
  {
    accessorKey: "contestName",
    header: "赛事",
    cell: ({ row }) => {
      const contestId = row.original.contestId;
      if (!contestId) {
        return "-";
      }

      return h(
        ULinkComponent,
        {
          to: `/contests/${contestId}`,
          target: "_blank",
          class: "text-primary hover:underline",
        },
        () => row.original.contestName,
      );
    },
  },
  { accessorKey: "level", header: "级别" },
  { accessorKey: "value", header: "积分" },
];

const ruleTabItems = computed<any[]>(() => {
  const config = activity.value?.scoringConfig || {};
  const entries = Object.entries(config);

  const awardRows: AwardRuleRow[] = [];
  const paperRows: TypeRuleRow[] = [];
  const patentRows: TypeRuleRow[] = [];
  const innovationRows: TypeRuleRow[] = [];
  const contestMultiplierRows: ContestRuleRow[] = [];
  const contestExtraRows: ContestRuleRow[] = [];

  for (const [key, value] of entries) {
    const parts = key.split(".");
    const numericValue = toNumberOrNegativeInfinity(value);

    if (parts[0] === "award" && parts.length >= 3) {
      awardRows.push({
        level: t(`awards.level.${parts[1]}`),
        type: t(`awards.type.${parts[2]}`),
        value: String(value),
        numericValue,
      });
      continue;
    }

    if (parts[0] === "paper" && parts.length >= 2) {
      paperRows.push({
        type: t(`papers.type.${parts[1]}`),
        value: String(value),
        numericValue,
      });
      continue;
    }

    if (parts[0] === "patent" && parts.length >= 2) {
      patentRows.push({
        type: t(`patents.type.${parts[1]}`),
        value: String(value),
        numericValue,
      });
      continue;
    }

    if (parts[0] === "innovation" && parts.length >= 2) {
      innovationRows.push({
        type: t(`innovations.type.${parts[1]}`),
        value: String(value),
        numericValue,
      });
      continue;
    }

    if (parts[0] === "contest" && parts.length >= 4) {
      const contestId = parts[2] || "";
      const levelText = t(`awards.level.${parts[3]}`);
      const row: ContestRuleRow = {
        contestId,
        contestName:
          contestNameMap.value.get(contestId) || `赛事 #${contestId}`,
        level: levelText,
        value: String(value),
        numericValue,
      };

      if (parts[1] === "multiplier") {
        contestMultiplierRows.push(row);
      } else {
        contestExtraRows.push(row);
      }
      continue;
    }

    // 仅支持已定义的规则分组，未识别 key 在前端直接忽略。
  }

  const items = [
    {
      key: "award-base",
      value: "award-base",
      label: "奖项基础分",
      columns: awardRuleColumns,
      rows: sortRuleRowsByValueDesc(awardRows),
    },
    {
      key: "paper-base",
      value: "paper-base",
      label: "论文基础分",
      columns: typeRuleColumns,
      rows: sortRuleRowsByValueDesc(paperRows),
    },
    {
      key: "patent-base",
      value: "patent-base",
      label: "专利基础分",
      columns: typeRuleColumns,
      rows: sortRuleRowsByValueDesc(patentRows),
    },
    {
      key: "innovation-base",
      value: "innovation-base",
      label: "大创基础分",
      columns: typeRuleColumns,
      rows: sortRuleRowsByValueDesc(innovationRows),
    },
    {
      key: "contest-multiplier",
      value: "contest-multiplier",
      label: "赛事积分倍数",
      columns: contestRuleColumns,
      rows: sortRuleRowsByValueDesc(contestMultiplierRows),
    },
    {
      key: "contest-extra",
      value: "contest-extra",
      label: "赛事额外加分",
      columns: contestRuleColumns,
      rows: sortRuleRowsByValueDesc(contestExtraRows),
    },
  ];

  return items;
});

function toItemRows(items: any[]) {
  return (items || []).map((item) => ({
    ...item,
    displayType: formatTypeLabel(item),
    achievementDate: formatDateTime(item.achievementDate),
    formula: `${item.baseScore} x ${item.multiplier} + ${item.extraScore} = ${item.finalScore}`,
  }));
}

const activeRuleItem = computed(() =>
  ruleTabItems.value.find((item: any) => item.value === activeRuleTab.value),
);

function onRuleTabUpdate(nextValue: string | number) {
  const normalized = String(nextValue);

  if (!hasHandledInitialRuleTabUpdate.value) {
    hasHandledInitialRuleTabUpdate.value = true;
    activeRuleTab.value = "";
    return;
  }

  if (activeRuleTab.value === normalized) {
    activeRuleTab.value = "";
    return;
  }

  activeRuleTab.value = normalized;
}

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

function formatCandidateType(item: any): string {
  if (item.achievementType === "award") {
    const levelLabel = item.levelKey ? t(`awards.level.${item.levelKey}`) : "";
    const typeLabel = item.typeKey ? t(`awards.type.${item.typeKey}`) : "";
    return [levelLabel, typeLabel].filter(Boolean).join(" + ") || item.typeText;
  }

  if (item.achievementType === "paper") {
    return item.typeKey ? t(`papers.type.${item.typeKey}`) : item.typeText;
  }

  if (item.achievementType === "patent") {
    return item.typeKey ? t(`patents.type.${item.typeKey}`) : item.typeText;
  }

  if (item.achievementType === "innovation") {
    return item.typeKey ? t(`innovations.type.${item.typeKey}`) : item.typeText;
  }

  return item.typeText || "";
}

async function createApplication() {
  if (!loggedIn.value) {
    navigateTo("/login");
    return;
  }
  if (creatingApplication.value || hasOwnApplication.value) return;

  try {
    creatingApplication.value = true;
    await $fetch(`/api/activities/${activityId.value}/applications`, {
      method: "POST",
      body: {},
    });
    await refresh();
    toast.add({ title: "申请已创建", color: "success" });
  } catch (e: any) {
    toast.add({
      title: "创建失败",
      description: e?.data?.message || e?.message,
      color: "error",
    });
  } finally {
    creatingApplication.value = false;
  }
}

async function loadAchievements() {
  if (!loggedIn.value) return;
  if (loadingAchievements.value) return;

  try {
    loadingAchievements.value = true;
    achievementPayload.value = await $fetch(
      `/api/activities/${activityId.value}/achievements`,
    );
  } finally {
    loadingAchievements.value = false;
  }
}

async function openAddItemModal(applicationId: number) {
  targetApplicationId.value = applicationId;
  selectedAchievementType.value = "award";
  selectedAchievementId.value = undefined;
  await loadAchievements();
  addModalOpen.value = true;
}

async function addItemToApplication() {
  if (!targetApplicationId.value || !selectedAchievementId.value) {
    toast.add({ title: "请选择要添加的条目", color: "warning" });
    return;
  }

  try {
    addingItem.value = true;
    await $fetch(`/api/applications/${targetApplicationId.value}/items`, {
      method: "POST",
      body: {
        achievementType: selectedAchievementType.value,
        achievementId: selectedAchievementId.value,
      },
    });
    await Promise.all([refresh(), loadAchievements()]);
    addModalOpen.value = false;
    toast.add({ title: "条目已添加", color: "success" });
  } catch (e: any) {
    toast.add({
      title: "添加失败",
      description: e?.data?.message || e?.message,
      color: "error",
    });
  } finally {
    addingItem.value = false;
  }
}

async function deleteItem(applicationId: number, itemId: number) {
  if (deletingItemId.value) return;

  try {
    deletingItemId.value = itemId;
    await $fetch(`/api/applications/${applicationId}/items/${itemId}`, {
      method: "DELETE",
    });
    await Promise.all([refresh(), loadAchievements()]);
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

watch(selectedAchievementType, () => {
  selectedAchievementId.value = undefined;
});
</script>

<template>
  <UContainer v-if="activity">
    <UPageHeader headline="申报" :title="activity.name">
      <template #description>
        <div class="space-y-3">
          <p>{{ activity.description || "" }}</p>

          <UTabs
            :model-value="activeRuleTab"
            :items="ruleTabItems"
            variant="pill"
            class="w-full"
            @update:model-value="onRuleTabUpdate"
          />

          <div v-if="activeRuleItem" class="space-y-2">
            <UAlert
              v-if="activeRuleItem.key === 'contest-multiplier'"
              title="不在名单上的赛事不加分。"
              color="warning"
            />
            <UTable
              :data="activeRuleItem.rows"
              :columns="activeRuleItem.columns"
              :ui="{ td: 'py-2' }"
            />
          </div>
        </div>
      </template>
      <template #links>
        <UButton
          v-if="loggedIn"
          icon="i-lucide-plus"
          :disabled="hasOwnApplication"
          :loading="creatingApplication"
          @click="createApplication"
        >
          新建申请
        </UButton>
        <UButton
          v-else
          to="/login"
          icon="i-lucide-log-in"
          color="neutral"
          variant="soft"
        >
          登录后可申请
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody class="space-y-6">
      <UAlert
        v-if="!loggedIn"
        icon="i-lucide-lock"
        color="warning"
        title="需要登录才能查看申请榜单与条目详情"
        description="登录后可查看申请列表、创建申请并管理自己的条目。"
      />

      <div v-if="loggedIn" class="rounded-lg border border-default">
        <UTable
          v-model:expanded="expanded"
          :data="tableData"
          :columns="columns"
          :loading="loading"
          :get-row-id="(row: TableRow) => `${row.rowType}-${row.id}`"
          :get-sub-rows="(row: TableRow) => row.children"
          :meta="{
            class: {
              tr: (row: any) =>
                row.original.rowType === 'application' && row.original.isCurrentUser
                  ? 'bg-primary/10 data-[expanded=true]:bg-primary/15'
                  : 'data-[expanded=true]:bg-elevated/40',
            },
          }"
          :ui="{
            base: 'border-separate border-spacing-0',
            tbody: '[&>tr]:last:[&>td]:border-b-0',
            tr: 'group',
            td: 'empty:p-0 group-has-[td:not(:empty)]:border-b border-default'
          }"
        >
          <template #rank-cell="{ row }">
            <span v-if="row.original.rowType === 'application'">
              {{ row.original.rank }}
            </span>
            <span v-else>-</span>
          </template>

          <template #name-cell="{ row }">
            <div class="flex items-center gap-2">
              <span>{{ row.original.user?.name || "-" }}</span>
              <UButton
                v-if="row.original.rowType === 'application' && row.original.isCurrentUser"
                icon="i-lucide-plus"
                size="xs"
                color="neutral"
                variant="ghost"
                @click="openAddItemModal(row.original.id)"
              />
            </div>
          </template>

          <template #actions-cell="{ row }">
            <UButton
              v-if="row.original.rowType === 'application' && row.original.isCurrentUser"
              icon="i-lucide-plus"
              size="xs"
              color="neutral"
              variant="ghost"
              @click="openAddItemModal(row.original.id)"
            />
            <UButton
              v-if="row.original.rowType === 'item' && row.original.canManage"
              icon="i-lucide-trash-2"
              size="xs"
              color="error"
              variant="ghost"
              :loading="deletingItemId === row.original.id"
              @click="deleteItem(row.original.parentApplicationId, row.original.id)"
            />
          </template>
        </UTable>
      </div>
    </UPageBody>

    <UModal v-if="loggedIn" v-model:open="addModalOpen" title="添加成就条目">
      <template #body>
        <div class="space-y-3">
          <UFormField label="成就类型">
            <USelect
              v-model="selectedAchievementType"
              class="w-full"
              :items="achievementTypeItems"
            />
          </UFormField>

          <UFormField label="可选成就（活动时间范围内）">
            <USelect
              v-model="selectedAchievementId"
              class="w-full"
              :items="achievementOptions"
              :loading="loadingAchievements"
              placeholder="请选择成就"
            />
          </UFormField>
        </div>
      </template>

      <template #footer>
        <UButton
          icon="i-lucide-plus"
          :loading="addingItem"
          @click="addItemToApplication"
        >
          添加
        </UButton>
      </template>
    </UModal>
  </UContainer>

  <UContainer v-else-if="pageLoading">
    <UPageHeader headline="申报" title="加载中..." />
  </UContainer>

  <UContainer v-else>
    <UPageHeader headline="申报" title="活动不存在" />
  </UContainer>
</template>
