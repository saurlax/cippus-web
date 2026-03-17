<script setup lang="ts">
defineProps<{
  evidences: string[];
}>();

const open = ref(false);
const currentPathname = ref("");

const currentEvidenceUrl = computed(() => {
  if (!currentPathname.value) {
    return "";
  }

  return getEvidenceUrl(currentPathname.value);
});

function getEvidenceUrl(pathname: string) {
  return `/images/${pathname}`;
}

function openImage(pathname: string) {
  currentPathname.value = pathname;
  open.value = true;
}
</script>

<template>
  <UPageGrid v-if="evidences.length" cols="2 sm:3">
    <button
      v-for="(pathname, index) in evidences"
      :key="`${pathname}-${index}`"
      type="button"
      class="rounded"
      @click="openImage(pathname)"
    >
      <img
        :src="getEvidenceUrl(pathname)"
        alt="evidence"
        class="h-32 w-full rounded object-cover"
      />
    </button>
  </UPageGrid>
  <p v-else class="text-sm text-muted">暂无附件</p>

  <UModal v-model:open="open" title="图片预览">
    <template #body>
      <img
        v-if="currentEvidenceUrl"
        :src="currentEvidenceUrl"
        alt="evidence"
        class="max-h-[70vh] w-full rounded object-contain"
      />
    </template>
  </UModal>
</template>
