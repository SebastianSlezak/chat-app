<script setup lang="ts">
import type { BookWithCategories } from '~/types'

const route = useRoute()
const { token } = useAuth()
const toast = useToast()

const book = ref<BookWithCategories | null>(null)
const loading = ref(true)
const updateProgressModal = ref(false)
const newProgress = ref(0)
const updatingProgress = ref(false)
const deleting = ref(false)

async function fetchBook() {
  loading.value = true
  try {
    const res = await $fetch(`/api/books/${route.params.id}`, {
      headers: { Authorization: `Bearer ${token.value}` }
    })

    if (res.success) {
      book.value = res.data
      newProgress.value = res.data.currentPage
    }
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'Failed to load book',
      color: 'red'
    })
    navigateTo('/dashboard')
  } finally {
    loading.value = false
  }
}

async function updateProgress() {
  if (!book.value) return

  updatingProgress.value = true
  try {
    const res = await $fetch(`/api/books/${route.params.id}/progress`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token.value}` },
      body: { currentPage: newProgress.value }
    })

    if (res.success) {
      book.value = res.data
      updateProgressModal.value = false
      toast.add({
        title: 'Success',
        description: 'Progress updated successfully',
        color: 'green'
      })
    }
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.data?.message || 'Failed to update progress',
      color: 'red'
    })
  } finally {
    updatingProgress.value = false
  }
}

async function deleteBook() {
  if (!confirm('Are you sure you want to delete this book?')) return

  deleting.value = true
  try {
    await $fetch(`/api/books/${route.params.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token.value}` }
    })

    toast.add({
      title: 'Success',
      description: 'Book deleted successfully',
      color: 'green'
    })
    navigateTo('/dashboard')
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.data?.message || 'Failed to delete book',
      color: 'red'
    })
  } finally {
    deleting.value = false
  }
}

function getProgressPercentage() {
  if (!book.value || book.value.totalPages === 0) return 0
  return Math.round((book.value.currentPage / book.value.totalPages) * 100)
}

function getStatusColor(status: string) {
  const colors = {
    to_read: 'gray',
    reading: 'blue',
    completed: 'green',
    abandoned: 'red'
  }
  return colors[status] || 'gray'
}

function getStatusLabel(status: string) {
  const labels = {
    to_read: 'To Read',
    reading: 'Reading',
    completed: 'Completed',
    abandoned: 'Abandoned'
  }
  return labels[status] || status
}

onMounted(() => {
  fetchBook()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center gap-4">
          <UButton to="/dashboard" variant="ghost" icon="i-lucide-arrow-left" size="sm">
            Back
          </UButton>
          <h1 class="text-2xl font-bold">Book Details</h1>
        </div>
      </div>
    </header>

    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="loading" class="text-center py-12">
        <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin mx-auto" />
      </div>

      <div v-else-if="book" class="space-y-6">
        <UCard>
          <div class="space-y-6">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h2 class="text-3xl font-bold mb-2">{{ book.title }}</h2>
                <p class="text-xl text-gray-600 dark:text-gray-400 mb-4">by {{ book.author }}</p>
                <UBadge :color="getStatusColor(book.status)" size="lg">
                  {{ getStatusLabel(book.status) }}
                </UBadge>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4 py-4 border-y border-gray-200 dark:border-gray-700">
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400">Total Pages</p>
                <p class="text-2xl font-bold">{{ book.totalPages }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400">Current Page</p>
                <p class="text-2xl font-bold">{{ book.currentPage }}</p>
              </div>
            </div>

            <div v-if="book.status === 'reading' || book.status === 'completed'" class="space-y-2">
              <div class="flex justify-between items-center">
                <span class="font-semibold">Reading Progress</span>
                <span class="text-sm text-gray-500">{{ getProgressPercentage() }}%</span>
              </div>
              <UProgress :value="getProgressPercentage()" size="lg" />
            </div>

            <div v-if="book.isbn" class="space-y-1">
              <p class="text-sm text-gray-500 dark:text-gray-400">ISBN</p>
              <p class="font-mono">{{ book.isbn }}</p>
            </div>

            <div v-if="book.categories.length > 0" class="space-y-2">
              <p class="text-sm text-gray-500 dark:text-gray-400">Categories</p>
              <div class="flex flex-wrap gap-2">
                <UBadge v-for="category in book.categories" :key="category.id" variant="soft">
                  {{ category.name }}
                </UBadge>
              </div>
            </div>

            <div v-if="book.rating" class="space-y-2">
              <p class="text-sm text-gray-500 dark:text-gray-400">Rating</p>
              <div class="flex items-center gap-1">
                <UIcon
                  v-for="i in 5"
                  :key="i"
                  name="i-lucide-star"
                  :class="i <= book.rating ? 'text-yellow-400' : 'text-gray-300'"
                  class="w-6 h-6"
                />
              </div>
            </div>

            <div v-if="book.review" class="space-y-2">
              <p class="text-sm text-gray-500 dark:text-gray-400">Review</p>
              <p class="text-gray-700 dark:text-gray-300">{{ book.review.content }}</p>
            </div>

            <div class="flex gap-3 pt-4">
              <UButton
                icon="i-lucide-refresh-cw"
                @click="updateProgressModal = true"
                block
              >
                Update Progress
              </UButton>
              <UButton
                :to="`/books/${book.id}/edit`"
                icon="i-lucide-pencil"
                variant="soft"
                block
              >
                Edit
              </UButton>
              <UButton
                icon="i-lucide-trash"
                color="red"
                variant="soft"
                @click="deleteBook"
                :loading="deleting"
                :disabled="deleting"
              />
            </div>
          </div>
        </UCard>
      </div>
    </div>

    <!-- Update Progress Modal -->
    <UModal v-model="updateProgressModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-bold">Update Reading Progress</h3>
        </template>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">Current Page</label>
            <UInput
              v-model.number="newProgress"
              type="number"
              :max="book?.totalPages"
              min="0"
            />
            <p class="text-sm text-gray-500 mt-1">Max: {{ book?.totalPages }} pages</p>
          </div>

          <div class="flex gap-3">
            <UButton
              @click="updateProgress"
              block
              :loading="updatingProgress"
              :disabled="updatingProgress"
            >
              Update
            </UButton>
            <UButton
              variant="soft"
              block
              @click="updateProgressModal = false"
              :disabled="updatingProgress"
            >
              Cancel
            </UButton>
          </div>
        </div>
      </UCard>
    </UModal>
  </div>
</template>