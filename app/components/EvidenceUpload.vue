<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue?: File[];
    evidences?: string[];
    maxSizeText?: string;
  }>(),
  {
    modelValue: () => [],
    evidences: () => [],
    maxSizeText: "4MB",
  },
);

const emit = defineEmits<{
  "update:modelValue": [files: File[]];
  "remove-evidence": [index: number];
}>();

const selectedFiles = computed(() => props.modelValue || []);

function onFileChange(value: File[] | null | undefined) {
  emit("update:modelValue", value || []);
}

function removeUploadedEvidence(index: number) {
  emit("remove-evidence", index);
}

function getEvidenceUrl(pathname: string) {
  return `/images/${pathname}`;
}

function getLocalFileUrl(file: File) {
  return URL.createObjectURL(file);
}
</script>

<template>
  <UFileUpload
    :model-value="selectedFiles"
    accept="image/*"
    multiple
    :interactive="false"
    label="上传图片"
    :description="`支持多张图片，单张不超过 ${maxSizeText}`"
    @update:model-value="onFileChange"
  >
    <template #default="{ open, removeFile }">
      <div class="space-y-3">
        <div class="flex items-center gap-2">
          <UButton
            color="neutral"
            variant="outline"
            icon="i-lucide-upload"
            label="选择图片"
            @click="open()"
          />
          <UButton
            v-if="selectedFiles.length"
            color="neutral"
            variant="ghost"
            label="清空待上传"
            @click="removeFile()"
          />
        </div>

        <UFormField v-if="evidences.length" label="已上传图片">
          <UPageGrid cols="2 sm:3" gap="3">
            <UChip
              v-for="(pathname, index) in evidences"
              :key="`${pathname}-${index}`"
              size="3xl"
            >
              <img
                :src="getEvidenceUrl(pathname)"
                alt="uploaded-evidence"
                class="h-28 w-full rounded object-cover"
              />
              <template #content>
                <UIcon name="i-lucide-x" @click="removeUploadedEvidence(index)" />
              </template>
            </UChip>
          </UPageGrid>
        </UFormField>

        <UFormField v-if="selectedFiles.length" label="待上传图片">
          <UPageGrid cols="2 sm:3" gap="3">
            <UChip
              v-for="(file, index) in selectedFiles"
              :key="`${file.name}-${index}`"
              size="3xl"
            >
              <img
                :src="getLocalFileUrl(file)"
                alt="local-evidence"
                class="h-28 w-full rounded object-cover"
              />
              <template #content>
                <UIcon name="i-lucide-x" @click="removeFile(index)" />
              </template>
            </UChip>
          </UPageGrid>
        </UFormField>
      </div>
    </template>
  </UFileUpload>
</template>
