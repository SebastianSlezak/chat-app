<script setup lang="ts">
const { fetchUser, isAuthenticated } = useAuth()

onMounted(async () => {
  if (isAuthenticated.value) {
    await fetchUser()
  }
})
</script>

<template>
  <UApp>
    <NuxtPage />
  </UApp>
</template>