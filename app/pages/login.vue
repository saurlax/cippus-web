<script setup lang="ts">
import type { AuthFormProps, FormSubmitEvent } from "@nuxt/ui";
const supabase = useSupabaseClient();
const appConfig = useAppConfig();
const toast = useToast();
const providers = ref([
  {
    label: "通过统一身份认证登录",
    icon: "i-lucide-log-in",
    to: `${appConfig.casBaseUrl}/login?service=${appConfig.casServiceUrl}`,
  },
]);

const fields = ref<AuthFormProps["fields"]>([
  {
    name: "email",
    type: "email",
    label: "邮箱",
  },
  {
    name: "password",
    type: "password",
    label: "密码",
  },
]);

async function login(payload: FormSubmitEvent<any>) {
  const { error } = await supabase.auth.signInWithPassword({
    email: payload.data.email,
    password: payload.data.password,
  });
  
  if (error) {
    toast.add({ title: error.message, color: "error" });
  } else {
    navigateTo("/");
  }
}
</script>

<template>
  <UCard class="max-w-md mx-auto my-4">
    <UAuthForm title="登录" :providers :fields @submit="login" />
  </UCard>
</template>
