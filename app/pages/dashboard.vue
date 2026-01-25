<script setup lang="ts">
import type { BookWithCategories, UserStats } from '~/types'

const { token, user, logout } = useAuth()
const toast = useToast()

const stats = ref<UserStats | null>(null)
const books = ref<BookWithCategories[]>([])
const loading = ref(true)
const statusFilter = ref<string>('all')

const statusOptions = [
  { 
    label: 'All Books', 
    value: 'all',
    icon: 'i-lucide-library',
    color: 'gray'
  },
  { 
    label: 'To Read', 
    value: 'to_read',
    icon: 'i-lucide-bookmark',
    color: 'blue'
  },
  { 
    label: 'Reading', 
    value: 'reading',
    icon: 'i-lucide-book-open',
    color: 'green'
  },
  { 
    label: 'Completed', 
    value: 'completed',
    icon: 'i-lucide-check-circle',
    color: 'purple'
  },
  { 
    label: 'Abandoned', 
    value: 'abandoned',
    icon: 'i-lucide-x-circle',
    color: 'red'
  }
]

const filteredBooks = computed(() => {
  if (statusFilter.value === 'all') return books.value
  return books.value.filter(book => book.status === statusFilter.value)
})

const currentFilterOption = computed(() => {
  return statusOptions.find(opt => opt.value === statusFilter.value) || statusOptions[0]
})

const filteredCount = computed(() => {
  return filteredBooks.value.length
})

const readingProgress = computed(() => {
  if (!stats.value || stats.value.totalPages === 0) return 0
  const progress = Math.round((stats.value.pagesRead / stats.value.totalPages) * 100)
  return Math.min(100, Math.max(0, progress))
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
    to_read: 'blue',
    reading: 'green',
    completed: 'purple',
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
  return Math.min(100, Math.max(0, progress))
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
    <!-- Header -->
    <header class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <UIcon name="i-lucide-book-open" class="w-6 h-6 text-white" />
            </div>
            <h1 class="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              BookTracker
            </h1>
          </div>
          <div class="flex items-center gap-3">
            <UButton 
              to="/books/new" 
              icon="i-lucide-plus" 
              size="lg"
              class="shadow-lg hover:shadow-xl transition-shadow"
            >
              Add Book
            </UButton>
            <UButton 
              variant="ghost" 
              icon="i-lucide-log-out" 
              size="lg" 
              @click="logout"
              class="hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600"
            >
              Logout
            </UButton>
          </div>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Welcome Section -->
      <div class="mb-8">
        <h2 class="text-4xl font-bold mb-2 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
          Welcome back, {{ user?.name }}!
        </h2>
        <p class="text-gray-600 dark:text-gray-400 text-lg">Here's your reading progress</p>
      </div>

      <!-- Stats Cards -->
      <div v-if="stats" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <UCard class="shadow-lg ring-1 ring-gray-200/50 dark:ring-gray-700/50 hover:shadow-xl transition-shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Books</p>
              <p class="text-4xl font-bold mt-2 bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent">
                {{ stats.totalBooks }}
              </p>
            </div>
            <div class="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-2xl">
              <UIcon name="i-lucide-book" class="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </UCard>

        <UCard class="shadow-lg ring-1 ring-gray-200/50 dark:ring-gray-700/50 hover:shadow-xl transition-shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400 font-medium">Currently Reading</p>
              <p class="text-4xl font-bold mt-2 bg-gradient-to-br from-green-600 to-green-800 dark:from-green-400 dark:to-green-600 bg-clip-text text-transparent">
                {{ stats.booksReading }}
              </p>
            </div>
            <div class="p-4 bg-green-100 dark:bg-green-900/30 rounded-2xl">
              <UIcon name="i-lucide-book-open" class="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </UCard>

        <UCard class="shadow-lg ring-1 ring-gray-200/50 dark:ring-gray-700/50 hover:shadow-xl transition-shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400 font-medium">Completed</p>
              <p class="text-4xl font-bold mt-2 bg-gradient-to-br from-purple-600 to-purple-800 dark:from-purple-400 dark:to-purple-600 bg-clip-text text-transparent">
                {{ stats.booksCompleted }}
              </p>
            </div>
            <div class="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-2xl">
              <UIcon name="i-lucide-check-circle" class="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </UCard>

        <UCard class="shadow-lg ring-1 ring-gray-200/50 dark:ring-gray-700/50 hover:shadow-xl transition-shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400 font-medium">Avg Rating</p>
              <p class="text-4xl font-bold mt-2 bg-gradient-to-br from-yellow-600 to-yellow-800 dark:from-yellow-400 dark:to-yellow-600 bg-clip-text text-transparent">
                {{ stats.averageRating.toFixed(1) }}
              </p>
            </div>
            <div class="p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-2xl">
              <UIcon name="i-lucide-star" class="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </UCard>
      </div>

      <!-- Overall Progress -->
      <UCard v-if="stats" class="mb-8 shadow-lg ring-1 ring-gray-200/50 dark:ring-gray-700/50">
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <h3 class="font-bold text-lg flex items-center gap-2">
              <UIcon name="i-lucide-trending-up" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Overall Reading Progress
            </h3>
            <span class="text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
              {{ stats.pagesRead }} / {{ stats.totalPages }} pages
            </span>
          </div>
          <UProgress 
            :model-value="readingProgress" 
            :key="`progress-${stats.pagesRead}`" 
            :animation="false"
            size="lg"
          />
          <p class="text-sm font-semibold text-right" :class="readingProgress >= 50 ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'">
            {{ readingProgress }}% complete
          </p>
        </div>
      </UCard>

      <!-- Books List -->
      <div class="space-y-6">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 class="text-2xl font-bold flex items-center gap-2">
              <UIcon name="i-lucide-library" class="w-6 h-6" />
              My Books
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Showing {{ filteredCount }} {{ filteredCount === 1 ? 'book' : 'books' }}
            </p>
          </div>

          <!-- Enhanced Filter Buttons -->
          <div class="flex flex-wrap gap-2">
            <button
              v-for="option in statusOptions"
              :key="option.value"
              @click="statusFilter = option.value"
              class="group relative px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 hover:scale-105"
              :class="[
                statusFilter === option.value
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              ]"
            >
              <span class="flex items-center gap-2">
                <UIcon 
                  :name="option.icon" 
                  class="w-4 h-4"
                />
                <span>{{ option.label }}</span>
                <span 
                  v-if="statusFilter === option.value"
                  class="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs font-bold"
                >
                  {{ filteredCount }}
                </span>
              </span>
            </button>
          </div>
        </div>

        <div v-if="loading" class="text-center py-20">
          <UIcon name="i-lucide-loader-2" class="w-12 h-12 animate-spin mx-auto text-blue-600 dark:text-blue-400" />
          <p class="text-gray-600 dark:text-gray-400 mt-4">Loading your books...</p>
        </div>

        <div v-else-if="filteredBooks.length === 0" class="text-center py-20">
          <div class="inline-block p-6 bg-gray-100 dark:bg-gray-800 rounded-3xl mb-4">
            <UIcon name="i-lucide-book-x" class="w-20 h-20 text-gray-400" />
          </div>
          <h3 class="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">No books found</h3>
          <p class="text-gray-500 dark:text-gray-400 mb-6">
            {{ statusFilter === 'all' ? 'Start building your library!' : `No books with status: ${currentFilterOption.label}` }}
          </p>
          <UButton to="/books/new" size="lg" icon="i-lucide-plus" class="shadow-lg">
            Add Your First Book
          </UButton>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <UCard 
            v-for="book in filteredBooks" 
            :key="book.id" 
            class="shadow-lg ring-1 ring-gray-200/50 dark:ring-gray-700/50 hover:shadow-2xl hover:scale-105 transition-all duration-200"
          >
            <div class="space-y-4">
              <div class="flex items-start justify-between gap-3">
                <div class="flex-1 min-w-0">
                  <h4 class="font-bold text-lg mb-1 truncate" :title="book.title">
                    {{ book.title }}
                  </h4>
                  <p class="text-sm text-gray-500 dark:text-gray-400 truncate" :title="book.author">
                    by {{ book.author }}
                  </p>
                </div>
                <UBadge 
                  :color="getStatusColor(book.status)" 
                  size="lg"
                  class="shrink-0"
                >
                  {{ getStatusLabel(book.status) }}
                </UBadge>
              </div>

              <div v-if="book.status === 'reading' || book.status === 'completed'" class="space-y-2">
                <div class="flex justify-between text-sm font-medium">
                  <span class="text-gray-600 dark:text-gray-400">Progress</span>
                  <span class="text-gray-900 dark:text-white">
                    {{ book.currentPage }} / {{ book.totalPages }} pages
                  </span>
                </div>
                <UProgress 
                  :model-value="getBookProgress(book)" 
                  :key="`book-${book.id}-progress`" 
                  :animation="false"
                  :color="book.status === 'completed' ? 'green' : 'blue'"
                />
                <p class="text-xs text-right font-semibold" :class="getBookProgress(book) === 100 ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'">
                  {{ getBookProgress(book) }}%
                </p>
              </div>

              <div v-if="book.rating" class="flex items-center gap-1">
                <UIcon
                  v-for="i in 5"
                  :key="i"
                  name="i-lucide-star"
                  :class="i <= book.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'"
                  class="w-5 h-5"
                />
                <span class="ml-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {{ book.rating }}.0
                </span>
              </div>

              <div class="flex gap-2 pt-2">
                <UButton
                  :to="`/books/${book.id}`"
                  variant="soft"
                  size="lg"
                  block
                  icon="i-lucide-eye"
                >
                  View
                </UButton>
                <UButton
                  :to="`/books/${book.id}?edit=true`"
                  variant="soft"
                  size="lg"
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