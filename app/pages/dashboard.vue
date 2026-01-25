<script setup lang="ts">
import type { BookWithCategories, UserStats } from '~/types'

const { token, user, logout } = useAuth()
const toast = useToast()

const stats = ref<UserStats | null>(null)
const books = ref<BookWithCategories[]>([])
const loading = ref(true)
const statusFilter = ref<string>('all')

const statusOptions = [
  { label: 'All Books', value: 'all' },
  { label: 'To Read', value: 'to_read' },
  { label: 'Reading', value: 'reading' },
  { label: 'Completed', value: 'completed' },
  { label: 'Abandoned', value: 'abandoned' }
]

const filteredBooks = computed(() => {
  if (statusFilter.value === 'all') return books.value
  return books.value.filter(book => book.status === statusFilter.value)
})

const readingProgress = computed(() => {
  if (!stats.value || stats.value.totalPages === 0) return 0
  const progress = Math.round((stats.value.pagesRead / stats.value.totalPages) * 100)
  return Math.min(100, Math.max(0, progress)) // Clamp between 0-100
})

async function fetchData() {
  loading.value = true
  try {
    const [statsRes, booksRes] = await Promise.all([
      $fetch('/api/stats', {
        headers: { Authorization: `Bearer ${token.value}` }
      }),
      $fetch('/api/books', {
        headers: { Authorization: `Bearer ${token.value}` }
      })
    ])

    if (statsRes.success) {
      stats.value = statsRes.data.overview
    }

    if (booksRes.success) {
      books.value = booksRes.data
    }
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'Failed to load data',
      color: 'red'
    })
  } finally {
    loading.value = false
  }
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

function getBookProgress(book: BookWithCategories) {
  if (!book || book.totalPages === 0) return 0
  const progress = Math.round((book.currentPage / book.totalPages) * 100)
  return Math.min(100, Math.max(0, progress)) // Clamp between 0-100
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <UIcon name="i-lucide-book-open" class="w-8 h-8 text-primary" />
            <h1 class="text-2xl font-bold">BookTracker</h1>
          </div>
          <div class="flex items-center gap-4">
            <UButton to="/books/new" icon="i-lucide-plus" size="sm">
              Add Book
            </UButton>
            <UButton variant="ghost" icon="i-lucide-log-out" size="sm" @click="logout">
              Logout
            </UButton>
          </div>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Welcome Section -->
      <div class="mb-8">
        <h2 class="text-3xl font-bold mb-2">Welcome back, {{ user?.name }}!</h2>
        <p class="text-gray-600 dark:text-gray-400">Here's your reading progress</p>
      </div>

      <!-- Stats Cards -->
      <div v-if="stats" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <UCard>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Total Books</p>
              <p class="text-3xl font-bold mt-1">{{ stats.totalBooks }}</p>
            </div>
            <UIcon name="i-lucide-book" class="w-12 h-12 text-blue-500" />
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Currently Reading</p>
              <p class="text-3xl font-bold mt-1">{{ stats.booksReading }}</p>
            </div>
            <UIcon name="i-lucide-book-open" class="w-12 h-12 text-green-500" />
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Completed</p>
              <p class="text-3xl font-bold mt-1">{{ stats.booksCompleted }}</p>
            </div>
            <UIcon name="i-lucide-check-circle" class="w-12 h-12 text-purple-500" />
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Avg Rating</p>
              <p class="text-3xl font-bold mt-1">{{ stats.averageRating.toFixed(1) }}</p>
            </div>
            <UIcon name="i-lucide-star" class="w-12 h-12 text-yellow-500" />
          </div>
        </UCard>
      </div>

      <!-- Overall Progress -->
      <UCard v-if="stats" class="mb-8">
        <div class="space-y-2">
          <div class="flex justify-between items-center">
            <h3 class="font-semibold">Overall Reading Progress</h3>
            <span class="text-sm text-gray-500">{{ stats.pagesRead }} / {{ stats.totalPages }} pages</span>
          </div>
          <UProgress :model-value="readingProgress" :key="`progress-${stats.pagesRead}`" :animation="false" />
          <p class="text-sm text-gray-500 text-right">{{ readingProgress }}% complete</p>
        </div>
      </UCard>

      <!-- Books List -->
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <h3 class="text-xl font-bold">My Books</h3>
          <USelectMenu
            v-model="statusFilter"
            :options="statusOptions"
            value-attribute="value"
            option-attribute="label"
          />
        </div>

        <div v-if="loading" class="text-center py-12">
          <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin mx-auto" />
        </div>

        <div v-else-if="filteredBooks.length === 0" class="text-center py-12">
          <UIcon name="i-lucide-book-x" class="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p class="text-gray-500">No books found</p>
          <UButton to="/books/new" class="mt-4" icon="i-lucide-plus">
            Add Your First Book
          </UButton>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <UCard v-for="book in filteredBooks" :key="book.id" class="hover:shadow-lg transition-shadow">
            <div class="space-y-4">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h4 class="font-bold text-lg mb-1">{{ book.title }}</h4>
                  <p class="text-sm text-gray-500">by {{ book.author }}</p>
                </div>
                <UBadge :color="getStatusColor(book.status)" size="sm">
                  {{ getStatusLabel(book.status) }}
                </UBadge>
              </div>

              <div v-if="book.status === 'reading' || book.status === 'completed'" class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{{ book.currentPage }} / {{ book.totalPages }} pages</span>
                </div>
                <UProgress :model-value="getBookProgress(book)" :key="`book-${book.id}-progress`" :animation="false" />
              </div>

              <div v-if="book.rating" class="flex items-center gap-1">
                <UIcon
                  v-for="i in 5"
                  :key="i"
                  name="i-lucide-star"
                  :class="i <= book.rating ? 'text-yellow-400' : 'text-gray-300'"
                  class="w-4 h-4"
                />
              </div>

              <div class="flex gap-2">
                <UButton
                  :to="`/books/${book.id}`"
                  variant="soft"
                  size="sm"
                  block
                  icon="i-lucide-eye"
                >
                  View
                </UButton>
                <UButton
                  :to="`/books/${book.id}?edit=true`"
                  variant="soft"
                  size="sm"
                  block
                  icon="i-lucide-pencil"
                  color="blue"
                >
                  Edit
                </UButton>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </div>
  </div>
</template>