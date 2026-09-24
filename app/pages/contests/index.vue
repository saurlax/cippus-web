<script setup lang="ts">
import { getInitialLetter } from "~/utils/pinyin-initial";

const { data: contests } = await useFetch("/api/contests");
const selectedLetter = ref("all");

const letterItems = computed(() => {
  const letters = Array.from(
    new Set((contests.value || []).map((contest: any) => getInitialLetter(contest.title))),
  ).sort((left, right) => {
    if (left === "#") return 1;
    if (right === "#") return -1;
    return left.localeCompare(right);
  });

  return [
    { label: "全部", value: "all" },
    ...letters.map((letter) => ({ label: letter, value: letter })),
  ];
});

const filteredContests = computed(() => {
  if (selectedLetter.value === "all") {
    return contests.value || [];
  }

  return (contests.value || []).filter(
    (contest: any) => getInitialLetter(contest.title) === selectedLetter.value,
  );
});

// 描述固定行数截断，避免长简介把卡片撑高；text-wrap 用于消除与 line-clamp 省略号的冲突
const descriptionClamp = "line-clamp-4 text-wrap";

const posts = computed(() => {
  return filteredContests.value.map((contest: any) => {
    return {
      title: contest.title,
      description: contest.description || "",
      date: contest.createdAt,
      to: `/contests/${contest.id}`,
      ui: { description: descriptionClamp },
    };
  });
});
</script>

<template>
  <UContainer>
    <UPageHeader title="收录竞赛" />
    <UPageBody>
      <UButtonGroup class="mb-6 flex flex-wrap">
        <UButton
          v-for="item in letterItems"
          :key="item.value"
          :label="item.label"
          :color="selectedLetter === item.value ? 'primary' : 'neutral'"
          :variant="selectedLetter === item.value ? 'solid' : 'outline'"
          @click="() => { selectedLetter = item.value }"
        />
      </UButtonGroup>
      <UBlogPosts v-spotlight :posts />
    </UPageBody>
  </UContainer>
</template>
