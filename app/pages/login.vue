<script setup lang="ts">
const providers = ref([
  {
    label: "SSO",
    icon: "i-lucide-log-in",
  },
]);
</script>

<template>
  <UCard class="max-w-md mx-auto my-4">
    <UAuthForm title="登录" :providers="providers" />
  </UCard>
</template>
