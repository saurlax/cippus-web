<script setup lang="ts">
defineProps<{
  evidences: string[];
}>();

function getEvidenceUrl(pathname: string) {
  return `/images/${pathname}`;
}
</script>

<template>
  <UPageGrid v-if="evidences.length" cols="2 sm:3">
    <img
      v-for="(pathname, index) in evidences"
      :key="`${pathname}-${index}`"
      :src="getEvidenceUrl(pathname)"
      alt="evidence"
      class="h-32 w-full rounded object-cover"
    />
  </UPageGrid>
  <p v-else class="text-sm text-muted">暂无附件</p>
</template>
