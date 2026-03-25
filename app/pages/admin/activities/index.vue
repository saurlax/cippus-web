<script setup lang="ts">
import { activityDefaultScoringConfig } from "#shared/types/db";

const UButton = resolveComponent("UButton");
const toast = useToast();
const { t } = useI18n();

type ScoringValue = string | number | boolean | number[];
type ScoringConfig = Record<string, ScoringValue>;

type AwardBaseRow = {
  level: string;
  type: string;
  score: number;
};

type PaperBaseRow = {
  type: string;
  score: number;
};

type PatentBaseRow = {
  type: string;
  score: number;
};

type InnovationBaseRow = {
  type: string;
  score: number;
};

type ContestExtraRow = {
  contestId: string;
  level: string;
  extraScore: number;
};

type ContestMultiplierRow = {
  contestId: string;
  level: string;
  multiplier: number;
};

const { data: activities } = await useFetch("/api/admin/activities");
const { data: contests } = await useFetch("/api/contests");

function readDefaultRankingFromShared(key: keyof typeof activityDefaultScoringConfig) {
  const value = activityDefaultScoringConfig[key];
  if (!Array.isArray(value)) {
    return [] as number[];
  }

  return value
    .map((item) => Number(item))
    .filter((item) => Number.isFinite(item));
}

const defaultRankingByType = {
  award: readDefaultRankingFromShared("ranking.award"),
  paper: readDefaultRankingFromShared("ranking.paper"),
  patent: readDefaultRankingFromShared("ranking.patent"),
  innovation: readDefaultRankingFromShared("ranking.innovation"),
};

const levelItems = awardLevelValues.map((value) => ({
  value,
  label: t(`awards.level.${value}`),
}));
const awardTypeItems = awardTypeValues.map((value) => ({
  value,
  label: t(`awards.type.${value}`),
}));
const paperTypeItems = paperTypeValues.map((value) => ({
  value,
  label: t(`papers.type.${value}`),
}));
const patentTypeItems = patentTypeValues.map((value) => ({
  value,
  label: t(`patents.type.${value}`),
}));
const innovationTypeItems = innovationTypeValues.map((value) => ({
  value,
  label: t(`innovations.type.${value}`),
}));
const contestItems = computed(() => 
  (contests.value || []).map((c: any) => ({
    value: String(c.id),
    label: c.title,
  }))
);

function toDateInputValue(value: string | Date | null | undefined): string {
  if (!value) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return value.includes("T") ? value.slice(0, 10) : value;
}

function normalizeScoringConfig(input: unknown): ScoringConfig {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {};

  const config: ScoringConfig = {};
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      config[key] = value;
      continue;
    }

    if (
      Array.isArray(value) &&
      value.every((item) => typeof item === "number" && Number.isFinite(item))
    ) {
      config[key] = [...value];
    }
  }
  return config;
}

function parseJsonScoringConfig(text: string): ScoringConfig {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("JSON 格式错误");
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("scoringConfig 必须是对象");
  }

  const config = normalizeScoringConfig(parsed);
  if (Object.keys(config).length !== Object.keys(parsed as object).length) {
    throw new Error("scoringConfig 的 value 仅支持 string/number/boolean/number[]");
  }

  return config;
}

function createEmptyActivity() {
  const defaultConfig = normalizeScoringConfig(activityDefaultScoringConfig);

  return {
    name: "",
    description: "",
    startDate: toDateInputValue(new Date()),
    endDate: toDateInputValue(new Date()),
    scoringConfig: { ...defaultConfig } as ScoringConfig,
  };
}

const columns = [
  { accessorKey: "id", header: "#" },
  { accessorKey: "name", header: "名称" },
  { accessorKey: "description", header: "描述" },
  { accessorKey: "startDate", header: "开始日期" },
  { accessorKey: "endDate", header: "结束日期" },
  { id: "actions", header: "操作" },
];

const openModal = ref(false);
const currentActivity = ref<any>(createEmptyActivity());
const editorMode = ref<"visual" | "json">("visual");
const scoringConfigText = ref(
  JSON.stringify(currentActivity.value.scoringConfig || {}, null, 2),
);

const awardBaseRows = ref<AwardBaseRow[]>([]);
const paperBaseRows = ref<PaperBaseRow[]>([]);
const patentBaseRows = ref<PatentBaseRow[]>([]);
const innovationBaseRows = ref<InnovationBaseRow[]>([]);
const contestExtraRows = ref<ContestExtraRow[]>([]);
const contestMultiplierRows = ref<ContestMultiplierRow[]>([]);
const otherEntries = ref<ScoringConfig>({});
const awardRankingCoefficients = ref<number[]>([...defaultRankingByType.award]);
const paperRankingCoefficients = ref<number[]>([...defaultRankingByType.paper]);
const patentRankingCoefficients = ref<number[]>([...defaultRankingByType.patent]);
const innovationRankingCoefficients = ref<number[]>([...defaultRankingByType.innovation]);

function openModalEditor(item?: any) {
  openEditor(item);
  openModal.value = true;
}

function closeModal() {
  openModal.value = false;
}

function readNumber(value: ScoringValue | undefined, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function readRankingCoefficients(value: ScoringValue | undefined, fallback: number[]) {
  if (Array.isArray(value)) {
    const parsed = value
      .map((item) => Number(item))
      .filter((item) => Number.isFinite(item));

    if (parsed.length) {
      return parsed;
    }
  }

  return [...fallback];
}

function addRankingCoefficient(target: number[]) {
  target.push(0.2);
}

function removeRankingCoefficient(target: number[], index: number) {
  if (target.length <= 1) {
    return;
  }
  target.splice(index, 1);
}

function openEditor(item?: any) {
  currentActivity.value = item
    ? {
        ...item,
        startDate: toDateInputValue(item.startDate),
        endDate: toDateInputValue(item.endDate),
        scoringConfig: normalizeScoringConfig(item.scoringConfig),
      }
    : createEmptyActivity();

  editorMode.value = "visual";
  buildVisualRowsFromConfig(currentActivity.value.scoringConfig);
}

function buildVisualRowsFromConfig(config: ScoringConfig = {}) {
  awardBaseRows.value = [];
  paperBaseRows.value = [];
  patentBaseRows.value = [];
  innovationBaseRows.value = [];
  contestExtraRows.value = [];
  contestMultiplierRows.value = [];
  otherEntries.value = {};
  awardRankingCoefficients.value = readRankingCoefficients(
    config["ranking.award"],
    defaultRankingByType.award,
  );
  paperRankingCoefficients.value = readRankingCoefficients(
    config["ranking.paper"],
    defaultRankingByType.paper,
  );
  patentRankingCoefficients.value = readRankingCoefficients(
    config["ranking.patent"],
    defaultRankingByType.patent,
  );
  innovationRankingCoefficients.value = readRankingCoefficients(
    config["ranking.innovation"],
    defaultRankingByType.innovation,
  );

  // 构建所有基础分行
  for (const level of awardLevelValues) {
    for (const type of awardTypeValues) {
      const key = `award.${level}.${type}`;
      awardBaseRows.value.push({
        level,
        type,
        score: readNumber(config[key]),
      });
    }
  }

  for (const type of paperTypeValues) {
    const key = `paper.${type}`;
    paperBaseRows.value.push({
      type,
      score: readNumber(config[key]),
    });
  }

  for (const type of patentTypeValues) {
    const key = `patent.${type}`;
    patentBaseRows.value.push({
      type,
      score: readNumber(config[key]),
    });
  }

  for (const type of innovationTypeValues) {
    const key = `innovation.${type}`;
    innovationBaseRows.value.push({
      type,
      score: readNumber(config[key]),
    });
  }

  // 解析比赛相关配置
  for (const [key, value] of Object.entries(config)) {
    if (/^contest\.extra\.[^.]+\.[^.]+$/.test(key)) {
      const parts = key.split(".");
      const contestId = parts[2] || "";
      const level = parts[3] || "";
      contestExtraRows.value.push({
        contestId,
        level,
        extraScore: readNumber(value),
      });
      continue;
    }

    if (/^contest\.multiplier\.[^.]+\.[^.]+$/.test(key)) {
      const parts = key.split(".");
      const contestId = parts[2] || "";
      const level = parts[3] || "";
      contestMultiplierRows.value.push({
        contestId,
        level,
        multiplier: readNumber(value, 1),
      });
      continue;
    }

    // 收集非基础分的其他条目
    if (
      !key.startsWith("award.") &&
      !key.startsWith("paper.") &&
      !key.startsWith("patent.") &&
      !key.startsWith("innovation.") &&
      !key.startsWith("ranking.") &&
      !key.startsWith("contest.")
    ) {
      otherEntries.value[key] = value;
    }
  }

  syncJsonText();
}

function buildConfigFromVisual(): ScoringConfig {
  const next: ScoringConfig = { ...otherEntries.value };

  next["ranking.award"] = [...awardRankingCoefficients.value];
  next["ranking.paper"] = [...paperRankingCoefficients.value];
  next["ranking.patent"] = [...patentRankingCoefficients.value];
  next["ranking.innovation"] = [...innovationRankingCoefficients.value];

  for (const row of awardBaseRows.value) {
    if (row.level.trim() && row.type.trim()) {
      next[`award.${row.level.trim()}.${row.type.trim()}`] = Number(
        row.score || 0,
      );
    }
  }

  for (const row of paperBaseRows.value) {
    if (row.type.trim()) {
      next[`paper.${row.type.trim()}`] = Number(row.score || 0);
    }
  }

  for (const row of patentBaseRows.value) {
    if (row.type.trim()) {
      next[`patent.${row.type.trim()}`] = Number(row.score || 0);
    }
  }

  for (const row of innovationBaseRows.value) {
    if (row.type.trim()) {
      next[`innovation.${row.type.trim()}`] = Number(row.score || 0);
    }
  }

  for (const row of contestExtraRows.value) {
    if (row.contestId.trim() && row.level.trim()) {
      next[`contest.extra.${row.contestId.trim()}.${row.level.trim()}`] =
        Number(row.extraScore || 0);
    }
  }

  for (const row of contestMultiplierRows.value) {
    if (row.contestId.trim() && row.level.trim()) {
      next[`contest.multiplier.${row.contestId.trim()}.${row.level.trim()}`] =
        Number(row.multiplier || 1);
    }
  }

  for (const key of Object.keys(next)) {
    if (
      key.startsWith("rule.whitelist.contest.") ||
      key === "rule.version" ||
      key === "rule.timeMode" ||
      key.startsWith("score.multiplier.level.") ||
      key.startsWith("score.extra.contest.") ||
      /^score\.base\.award\.[^.]+$/.test(key)
    ) {
      delete next[key];
    }
  }

  currentActivity.value.scoringConfig = next;
  return next;
}

function syncJsonText() {
  scoringConfigText.value = JSON.stringify(
    currentActivity.value.scoringConfig || {},
    null,
    2,
  );
}

function switchEditorMode(mode: "visual" | "json") {
  if (mode === editorMode.value) return;

  if (mode === "json") {
    buildConfigFromVisual();
    syncJsonText();
    editorMode.value = mode;
    return;
  }

  try {
    const parsed = parseJsonScoringConfig(scoringConfigText.value);
    currentActivity.value.scoringConfig = parsed;
    buildVisualRowsFromConfig(parsed);
    editorMode.value = mode;
  } catch (e: any) {
    toast.add({
      title: "JSON 解析失败",
      description: e?.data?.message || e?.message,
      color: "error",
    });
  }
}

function applyJsonEditor() {
  try {
    const parsed = parseJsonScoringConfig(scoringConfigText.value);
    currentActivity.value.scoringConfig = parsed;
    buildVisualRowsFromConfig(parsed);
    toast.add({
      title: "JSON 已应用到可视化编辑器",
      color: "success",
    });
  } catch (e: any) {
    toast.add({
      title: "JSON 解析失败",
      description: e?.data?.message || e?.message,
      color: "error",
    });
  }
}

function createActivity() {
  openModalEditor();
}

async function updateActivity() {
  const activity = currentActivity.value;
  if (!activity) return;

  try {
    if (editorMode.value === "json") {
      activity.scoringConfig = parseJsonScoringConfig(scoringConfigText.value);
    } else {
      activity.scoringConfig = buildConfigFromVisual();
    }

    if (activity.id) {
      await $fetch<any>(`/api/admin/activities/${activity.id}`, {
        method: "PUT",
        body: activity,
      });
    } else {
      await $fetch<any>(`/api/admin/activities`, {
        method: "POST",
        body: activity,
      });
    }

    activities.value = await $fetch<any>("/api/admin/activities");
    closeModal();
    toast.add({ title: "活动已保存", color: "success" });
  } catch (e: any) {
    toast.add({
      title: "保存失败",
      description: e?.data?.message || e?.message,
      color: "error",
    });
  }
}

watch(
  [
    awardBaseRows,
    paperBaseRows,
    patentBaseRows,
    innovationBaseRows,
    contestExtraRows,
    contestMultiplierRows,
    awardRankingCoefficients,
    paperRankingCoefficients,
    patentRankingCoefficients,
    innovationRankingCoefficients,
  ],
  () => {
    if (editorMode.value === "visual") {
      buildConfigFromVisual();
      syncJsonText();
    }
  },
  { deep: true },
);
</script>

<template>
  <UDashboardNavbar title="申报管理">
    <template #right>
      <UButton @click="createActivity">新建活动</UButton>
    </template>
  </UDashboardNavbar>
  <UTable :data="activities" :columns>
    <template #name-cell="{ row }">
      <ULink :to="`/admin/activities/${row.original.id}`" class="text-primary hover:underline">
        {{ row.original.name }}
      </ULink>
    </template>
    <template #startDate-cell="{ row }">
      {{ new Date(row.original.startDate).toLocaleString() }}
    </template>
    <template #endDate-cell="{ row }">
      {{ new Date(row.original.endDate).toLocaleString() }}
    </template>
    <template #actions-cell="{ row }">
      <UButton
        icon="i-lucide-edit"
        size="sm"
        color="neutral"
        variant="ghost"
        @click="openModalEditor(row.original)"
      />
    </template>
  </UTable>
  <UModal v-model:open="openModal" title="编辑活动">
    <template #body>
      <UForm class="flex flex-col gap-2" @submit="updateActivity">
        <UFormField label="名称" name="name" required>
          <UInput
            class="w-full"
            v-model="currentActivity.name"
            placeholder="请输入活动名称"
          />
        </UFormField>
        <UFormField label="描述" name="description">
          <UTextarea
            class="w-full"
            v-model="currentActivity.description"
            placeholder="请输入活动描述"
          />
        </UFormField>
        <UFormField label="开始日期" name="startDate" required>
          <UInput
            class="w-full"
            type="date"
            v-model="currentActivity.startDate"
          />
        </UFormField>
        <UFormField label="结束日期" name="endDate" required>
          <UInput
            class="w-full"
            type="date"
            v-model="currentActivity.endDate"
          />
        </UFormField>

        <div class="rounded-md border border-default p-3 space-y-3">
          <div class="flex items-center justify-between gap-2">
            <h3 class="text-sm font-medium">积分规则</h3>
            <div class="flex gap-2">
              <UButton
                size="xs"
                :variant="editorMode === 'visual' ? 'solid' : 'soft'"
                @click="switchEditorMode('visual')"
              >
                可视化编辑
              </UButton>
              <UButton
                size="xs"
                :variant="editorMode === 'json' ? 'solid' : 'soft'"
                @click="switchEditorMode('json')"
              >
                JSON 编辑
              </UButton>
            </div>
          </div>

          <template v-if="editorMode === 'visual'">
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <p class="text-sm font-medium">奖项排名系数</p>
                <UButton
                  size="xs"
                  variant="soft"
                  icon="i-lucide-plus"
                  @click="addRankingCoefficient(awardRankingCoefficients)"
                >
                  添加
                </UButton>
              </div>
              <div
                v-for="(value, idx) in awardRankingCoefficients"
                :key="`award-ranking-${idx}`"
                class="grid grid-cols-12 gap-2 items-center"
              >
                <div class="col-span-3 text-sm">第 {{ idx + 1 }} 名</div>
                <UInput
                  class="col-span-8"
                  type="number"
                  step="0.01"
                  v-model.number="awardRankingCoefficients[idx]"
                />
                <UButton
                  class="col-span-1"
                  size="xs"
                  color="error"
                  variant="ghost"
                  icon="i-lucide-trash-2"
                  @click="removeRankingCoefficient(awardRankingCoefficients, idx)"
                />
              </div>
            </div>

            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <p class="text-sm font-medium">论文排名系数</p>
                <UButton
                  size="xs"
                  variant="soft"
                  icon="i-lucide-plus"
                  @click="addRankingCoefficient(paperRankingCoefficients)"
                >
                  添加
                </UButton>
              </div>
              <div
                v-for="(value, idx) in paperRankingCoefficients"
                :key="`paper-ranking-${idx}`"
                class="grid grid-cols-12 gap-2 items-center"
              >
                <div class="col-span-3 text-sm">第 {{ idx + 1 }} 名</div>
                <UInput
                  class="col-span-8"
                  type="number"
                  step="0.01"
                  v-model.number="paperRankingCoefficients[idx]"
                />
                <UButton
                  class="col-span-1"
                  size="xs"
                  color="error"
                  variant="ghost"
                  icon="i-lucide-trash-2"
                  @click="removeRankingCoefficient(paperRankingCoefficients, idx)"
                />
              </div>
            </div>

            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <p class="text-sm font-medium">专利排名系数</p>
                <UButton
                  size="xs"
                  variant="soft"
                  icon="i-lucide-plus"
                  @click="addRankingCoefficient(patentRankingCoefficients)"
                >
                  添加
                </UButton>
              </div>
              <div
                v-for="(value, idx) in patentRankingCoefficients"
                :key="`patent-ranking-${idx}`"
                class="grid grid-cols-12 gap-2 items-center"
              >
                <div class="col-span-3 text-sm">第 {{ idx + 1 }} 名</div>
                <UInput
                  class="col-span-8"
                  type="number"
                  step="0.01"
                  v-model.number="patentRankingCoefficients[idx]"
                />
                <UButton
                  class="col-span-1"
                  size="xs"
                  color="error"
                  variant="ghost"
                  icon="i-lucide-trash-2"
                  @click="removeRankingCoefficient(patentRankingCoefficients, idx)"
                />
              </div>
            </div>

            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <p class="text-sm font-medium">大创排名系数</p>
                <UButton
                  size="xs"
                  variant="soft"
                  icon="i-lucide-plus"
                  @click="addRankingCoefficient(innovationRankingCoefficients)"
                >
                  添加
                </UButton>
              </div>
              <div
                v-for="(value, idx) in innovationRankingCoefficients"
                :key="`innovation-ranking-${idx}`"
                class="grid grid-cols-12 gap-2 items-center"
              >
                <div class="col-span-3 text-sm">第 {{ idx + 1 }} 名</div>
                <UInput
                  class="col-span-8"
                  type="number"
                  step="0.01"
                  v-model.number="innovationRankingCoefficients[idx]"
                />
                <UButton
                  class="col-span-1"
                  size="xs"
                  color="error"
                  variant="ghost"
                  icon="i-lucide-trash-2"
                  @click="removeRankingCoefficient(innovationRankingCoefficients, idx)"
                />
              </div>
            </div>

            <div class="space-y-2">
              <p class="text-sm font-medium">奖项基础分</p>
              <div
                v-for="(row, idx) in awardBaseRows"
                :key="`award-${idx}`"
                class="grid grid-cols-12 gap-2 items-center"
              >
                <div class="col-span-3 text-sm">
                  {{ t(`awards.level.${row.level}`) }}
                </div>
                <div class="col-span-4 text-sm">
                  {{ t(`awards.type.${row.type}`) }}
                </div>
                <UInput
                  class="col-span-5"
                  type="number"
                  v-model.number="row.score"
                />
              </div>
            </div>

            <div class="space-y-2">
              <p class="text-sm font-medium">论文基础分</p>
              <div
                v-for="(row, idx) in paperBaseRows"
                :key="`paper-${idx}`"
                class="grid grid-cols-12 gap-2 items-center"
              >
                <div class="col-span-7 text-sm">
                  {{ t(`papers.type.${row.type}`) }}
                </div>
                <UInput
                  class="col-span-5"
                  type="number"
                  v-model.number="row.score"
                />
              </div>
            </div>

            <div class="space-y-2">
              <p class="text-sm font-medium">专利基础分</p>
              <div
                v-for="(row, idx) in patentBaseRows"
                :key="`patent-${idx}`"
                class="grid grid-cols-12 gap-2 items-center"
              >
                <div class="col-span-7 text-sm">
                  {{ t(`patents.type.${row.type}`) }}
                </div>
                <UInput
                  class="col-span-5"
                  type="number"
                  v-model.number="row.score"
                />
              </div>
            </div>

            <div class="space-y-2">
              <p class="text-sm font-medium">大创基础分</p>
              <div
                v-for="(row, idx) in innovationBaseRows"
                :key="`innovation-${idx}`"
                class="grid grid-cols-12 gap-2 items-center"
              >
                <div class="col-span-7 text-sm">
                  {{ t(`innovations.type.${row.type}`) }}
                </div>
                <UInput
                  class="col-span-5"
                  type="number"
                  v-model.number="row.score"
                />
              </div>
            </div>

            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <p class="text-sm font-medium">竞赛额外加分</p>
                <UButton
                  size="xs"
                  variant="soft"
                  icon="i-lucide-plus"
                  @click="
                    contestExtraRows.push({
                      contestId: '',
                      level: 'national',
                      extraScore: 0,
                    })
                  "
                >
                  添加
                </UButton>
              </div>
              <div
                v-for="(row, idx) in contestExtraRows"
                :key="`contest-extra-${idx}`"
                class="grid grid-cols-12 gap-2 items-center"
              >
                <USelect
                  class="col-span-4"
                  v-model="row.contestId"
                  :items="contestItems"
                  placeholder="选择竞赛"
                />
                <USelect
                  class="col-span-4"
                  v-model="row.level"
                  :items="levelItems as any"
                />
                <UInput
                  class="col-span-3"
                  type="number"
                  v-model.number="row.extraScore"
                />
                <UButton
                  class="col-span-1"
                  size="xs"
                  color="error"
                  variant="ghost"
                  icon="i-lucide-trash-2"
                  @click="contestExtraRows.splice(idx, 1)"
                />
              </div>
            </div>

            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <p class="text-sm font-medium">竞赛倍数</p>
                <UButton
                  size="xs"
                  variant="soft"
                  icon="i-lucide-plus"
                  @click="
                    contestMultiplierRows.push({
                      contestId: '',
                      level: 'national',
                      multiplier: 1,
                    })
                  "
                >
                  添加
                </UButton>
              </div>
              <div
                v-for="(row, idx) in contestMultiplierRows"
                :key="`contest-multiplier-${idx}`"
                class="grid grid-cols-12 gap-2 items-center"
              >
                <USelect
                  class="col-span-4"
                  v-model="row.contestId"
                  :items="contestItems"
                  placeholder="选择竞赛"
                />
                <USelect
                  class="col-span-4"
                  v-model="row.level"
                  :items="levelItems as any"
                />
                <UInput
                  class="col-span-3"
                  type="number"
                  step="0.01"
                  v-model.number="row.multiplier"
                />
                <UButton
                  class="col-span-1"
                  size="xs"
                  color="error"
                  variant="ghost"
                  icon="i-lucide-trash-2"
                  @click="contestMultiplierRows.splice(idx, 1)"
                />
              </div>
              <p class="text-xs text-muted">未在列表内的竞赛默认不计分</p>
            </div>
          </template>

          <template v-else>
            <UFormField label="scoringConfig JSON">
              <UTextarea
                class="w-full"
                :rows="16"
                v-model="scoringConfigText"
                placeholder="请输入 JSON 对象"
              />
            </UFormField>
            <div class="flex justify-end">
              <UButton size="sm" variant="soft" @click="applyJsonEditor">
                应用到可视化编辑器
              </UButton>
            </div>
          </template>
        </div>
      </UForm>
    </template>
    <template #footer>
      <UButton @click="updateActivity">提交</UButton>
    </template>
  </UModal>
</template>
