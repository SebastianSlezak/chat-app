<script setup lang="ts">
import { LazyBookEditModal } from '#components'

const route = useRoute()
const router = useRouter()
const overlay = useOverlay()

const openEditModal = async () => {
  const modal = overlay.create(LazyBookEditModal, {
    destroyOnClose: true,
    props: {
      bookId: route.params.id
    }
  })

  const result = await modal.open()

  // If book was updated successfully, navigate to book details
  if (result) {
    await router.push(`/books/${route.params.id}`)
  } else {
    // If cancelled, navigate back to book details
    await router.push(`/books/${route.params.id}`)
  }
}

// Open modal immediately when page loads
onMounted(() => {
  openEditModal()
})
</script>

<template>
  <div />
</template>
