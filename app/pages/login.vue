<script setup lang="ts">
import type { AuthFormProps, FormSubmitEvent } from "@nuxt/ui";
const appConfig = useAppConfig();
const providers = ref([
  {
    label: "通过统一身份认证登录",
    icon: "i-lucide-log-in",
    to: `${appConfig.casBaseUrl}/login?service=${appConfig.casService}`,
  },
]);

const fields = ref<AuthFormProps["fields"]>([
  {
    name: "username",
    type: "text",
    label: "Username",
  },
  {
    name: "password",
    type: "password",
    label: "Password",
  },
]);

function login(payload: FormSubmitEvent<typeof fields.value>) {
  $fetch("/api/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
</script>

<template>
  <UCard class="max-w-md mx-auto my-4">
    <UAuthForm title="登录" :providers :fields @submit="login" />
  </UCard>
</template>
