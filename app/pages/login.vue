<script setup lang="ts">
import type { AuthFormProps, FormSubmitEvent } from "@nuxt/ui";
const { fetch } = useUserSession();
const appConfig = useAppConfig();
const toast = useToast();
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
    label: "用户名",
  },
  {
    name: "password",
    type: "password",
    label: "密码",
  },
]);

function login(payload: FormSubmitEvent<any>) {
  $fetch("/api/login", {
    method: "POST",
    body: payload.data,
  })
    .then(async () => {
      await fetch();
      navigateTo("/");
    })
    .catch((err) => {
      console.log(err);
      
      toast.add({ title: err.toString(), color: "error" });
    });
}
</script>

<template>
  <UCard class="max-w-md mx-auto my-4">
    <UAuthForm title="登录" :providers :fields @submit="login" />
  </UCard>
</template>
