<script setup lang="ts">
const { data: contests } = await useFetch("/api/contests");
const selectedLetter = ref("all");

function getContestInitial(title: unknown) {
  const first = String(title || "").trim().match(/[A-Za-z]/)?.[0];
  return first ? first.toUpperCase() : "#";
}

const letterItems = computed(() => {
  const letters = Array.from(
    new Set((contests.value || []).map((contest: any) => getContestInitial(contest.title))),
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
    (contest: any) => getContestInitial(contest.title) === selectedLetter.value,
  );
});

const posts = computed(() => {
  return filteredContests.value.map((contest: any) => {
    return {
      title: contest.title,
      description: contest.description || "",
      date: contest.createdAt,
      to: `/contests/${contest.id}`,
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
      <UBlogPosts :posts />
    </UPageBody>
  </UContainer>
</template>
