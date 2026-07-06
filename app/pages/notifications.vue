<script setup lang="ts">
const toast = useToast();
const { data, refresh } = await useFetch("/api/notifications");

const notifications = computed(() => data.value?.notifications || []);
const unreadCount = computed(() => data.value?.unreadCount || 0);

function getResourceLink(notification: any) {
  return notification.resourceType && notification.resourceId ? "/reviews" : undefined;
}

async function markAsRead(id: number) {
  try {
    await $fetch(`/api/notifications/${id}`, { method: "PUT" });
    await refresh();
  } catch (e: any) {
    toast.add({
      title: "标记失败",
      description: e.data?.message || e.message,
      color: "error",
    });
  }
}
</script>

<template>
  <UContainer>
    <UPageHeader title="站内信" :description="`未读 ${unreadCount} 条`" />
    <UPageBody>
      <div v-if="notifications.length" class="space-y-3">
        <UPageCard
          v-for="notification in notifications"
          :key="notification.id"
          :title="notification.title"
          :description="notification.content"
          :variant="notification.readAt ? 'subtle' : 'outline'"
        >
          <template #header>
            <div class="flex items-center justify-between gap-3">
              <div class="min-w-0">
                <p class="font-medium truncate">{{ notification.title }}</p>
                <p class="text-sm text-muted">
                  {{ new Date(notification.createdAt).toLocaleString() }}
                </p>
              </div>
              <UBadge
                v-if="!notification.readAt"
                color="primary"
                variant="subtle"
              >
                未读
              </UBadge>
            </div>
          </template>

          <p>{{ notification.content }}</p>

          <template v-if="!notification.readAt || getResourceLink(notification)" #footer>
            <UButton
              v-if="getResourceLink(notification)"
              icon="i-lucide-arrow-right"
              variant="outline"
              :to="getResourceLink(notification)"
            >
              查看相关成果
            </UButton>
            <UButton
              v-if="!notification.readAt"
              icon="i-lucide-check"
              variant="soft"
              @click="markAsRead(notification.id)"
            >
              标为已读
            </UButton>
          </template>
        </UPageCard>
      </div>
      <UEmpty
        v-else
        icon="i-lucide-inbox"
        title="暂无站内信"
        description="新的审核结果会显示在这里。"
      />
    </UPageBody>
  </UContainer>
</template>