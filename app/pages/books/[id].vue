<script setup lang="ts">
import type { BookWithCategories } from '~/types'
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

interface Category {
  id: number
  name: string
  description?: string | null
}

const route = useRoute()
const router = useRouter()
const { token } = useAuth()
const toast = useToast()

const book = ref<BookWithCategories | null>(null)
const loading = ref(true)
const editModal = ref(false)
const editingProgress = ref(false)
const newProgress = ref(0)
const updatingProgress = ref(false)
const deleting = ref(false)

const editLoading = ref(false)
const saving = ref(false)
const categories = ref<Category[]>([])

const editSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  author: z.string().min(1, 'Author is required'),
  isbn: z.string().optional(),
  totalPages: z.number().min(1, 'Total pages must be at least 1'),
  currentPage: z.number().min(0).optional(),
  status: z.enum(['to_read', 'reading', 'completed', 'abandoned']),
  rating: z.number().min(1).max(5).optional().nullable(),
  categoryIds: z.array(z.number()).optional()
})

type EditSchema = z.output<typeof editSchema>

const editState = reactive({
  title: '',
  author: '',
  isbn: '',
  totalPages: 0,
  currentPage: 0,
  status: 'to_read' as const,
  rating: null as number | null,
  categoryIds: [] as number[]
})

const statusOptions = [
  { label: 'To Read', value: 'to_read' },
  { label: 'Reading', value: 'reading' },
  { label: 'Completed', value: 'completed' },
  { label: 'Abandoned', value: 'abandoned' }
]

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

function startEditingProgress() {
  if (!book.value) return
  newProgress.value = book.value.currentPage
  editingProgress.value = true
}

function cancelEditingProgress() {
  editingProgress.value = false
  newProgress.value = book.value?.currentPage || 0
}

async function saveProgress() {
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
      editingProgress.value = false
      toast.add({
        title: 'Success',
        description: 'Progress updated',
        color: 'primary'
      })
    }
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.data?.message || 'Failed to update progress',
      color: 'error'
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

async function loadEditData() {
  editLoading.value = true
  try {
    const [bookRes, categoriesRes] = await Promise.all([
      $fetch<any>(`/api/books/${route.params.id}`, {
        headers: { Authorization: `Bearer ${token.value}` }
      }),
      $fetch<any>('/api/categories', {
        headers: { Authorization: `Bearer ${token.value}` }
      })
    ])

    if (bookRes.success && bookRes.data) {
      editState.title = bookRes.data.title
      editState.author = bookRes.data.author
      editState.isbn = bookRes.data.isbn || ''
      editState.totalPages = bookRes.data.totalPages
      editState.currentPage = bookRes.data.currentPage
      editState.status = bookRes.data.status
      editState.rating = bookRes.data.rating
      editState.categoryIds = bookRes.data.categories?.map((c: Category) => c.id) || []
    }

    if (categoriesRes.success && categoriesRes.data) {
      categories.value = categoriesRes.data
    }
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'Failed to load book',
      color: 'error'
    })
    editModal.value = false
  } finally {
    editLoading.value = false
  }
}

async function openEditModal() {
  await loadEditData()
  editModal.value = true
}

async function onEditSubmit(event: FormSubmitEvent<EditSchema>) {
  saving.value = true
  try {
    const res = await $fetch(`/api/books/${route.params.id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token.value}` },
      body: event.data
    })

    if (res.success) {
      toast.add({
        title: 'Success',
        description: 'Book updated successfully',
        color: 'primary'
      })
      editModal.value = false
      await fetchBook()
    }
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.data?.message || 'Failed to update book',
      color: 'error'
    })
  } finally {
    saving.value = false
  }
}

function getProgressPercentage() {
  if (!book.value || book.value.totalPages === 0) return 0
  const progress = Math.round((book.value.currentPage / book.value.totalPages) * 100)
  return Math.min(100, Math.max(0, progress))
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

onMounted(async () => {
  await fetchBook()

  if (route.query.edit === 'true') {
    await openEditModal()
    router.replace({ query: {} })
  }
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
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Current Page</p>
                <div v-if="!editingProgress" class="flex items-center gap-2">
                  <p class="text-2xl font-bold">{{ book.currentPage }}</p>
                  <UButton
                    @click="startEditingProgress"
                    icon="i-lucide-pencil"
                    size="xs"
                    variant="ghost"
                    color="gray"
                  />
                </div>
                <div v-else class="flex items-center gap-2">
                  <UInput
                    v-model.number="newProgress"
                    type="number"
                    :max="book.totalPages"
                    min="0"
                    size="sm"
                    class="w-24"
                    autofocus
                  />
                  <UButton
                    @click="saveProgress"
                    icon="i-lucide-check"
                    size="xs"
                    color="primary"
                    :loading="updatingProgress"
                    :disabled="updatingProgress"
                  />
                  <UButton
                    @click="cancelEditingProgress"
                    icon="i-lucide-x"
                    size="xs"
                    variant="ghost"
                    color="gray"
                    :disabled="updatingProgress"
                  />
                </div>
              </div>
            </div>

            <div v-if="book.status === 'reading' || book.status === 'completed'" class="space-y-2">
              <div class="flex justify-between items-center">
                <span class="font-semibold">Reading Progress</span>
                <span class="text-sm text-gray-500">{{ getProgressPercentage() }}%</span>
              </div>
              <UProgress :model-value="getProgressPercentage()" :key="`book-${book.id}-detail-progress`" :animation="false" size="lg" />
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
                @click="openEditModal"
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

    <!-- Edit Book Modal -->
    <UModal v-model="editModal" title="Edit Book" class="sm:max-w-2xl">
      <template #content>
        <div v-if="editLoading" class="p-8 text-center">
          <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin mx-auto" />
        </div>

        <UForm v-if="!editLoading" :schema="editSchema" :state="editState" @submit="onEditSubmit" class="p-6 space-y-6">
          <UFormGroup label="Title" name="title" required>
            <UInput
              v-model="editState.title"
              placeholder="Enter book title"
              icon="i-lucide-book"
            />
          </UFormGroup>

          <UFormGroup label="Author" name="author" required>
            <UInput
              v-model="editState.author"
              placeholder="Enter author name"
              icon="i-lucide-user"
            />
          </UFormGroup>

          <UFormGroup label="ISBN" name="isbn" description="Optional">
            <UInput
              v-model="editState.isbn"
              placeholder="978-3-16-148410-0"
              icon="i-lucide-barcode"
            />
          </UFormGroup>

          <div class="grid grid-cols-2 gap-4">
            <UFormGroup label="Total Pages" name="totalPages" required>
              <UInput
                v-model.number="editState.totalPages"
                type="number"
                placeholder="0"
                icon="i-lucide-file-text"
              />
            </UFormGroup>

            <UFormGroup label="Current Page" name="currentPage">
              <UInput
                v-model.number="editState.currentPage"
                type="number"
                placeholder="0"
                icon="i-lucide-bookmark"
              />
            </UFormGroup>
          </div>

          <UFormGroup label="Status" name="status" required>
            <USelectMenu
              v-model="editState.status"
              :options="statusOptions"
              value-attribute="value"
              option-attribute="label"
            />
          </UFormGroup>

          <UFormGroup label="Rating" name="rating" description="Rate from 1 to 5 stars">
            <div class="flex gap-2">
              <UButton
                v-for="i in 5"
                :key="i"
                :variant="editState.rating && i <= editState.rating ? 'solid' : 'outline'"
                :color="editState.rating && i <= editState.rating ? 'warning' : 'neutral'"
                size="sm"
                icon="i-lucide-star"
                @click="editState.rating = i"
              />
              <UButton
                v-if="editState.rating"
                variant="ghost"
                size="sm"
                icon="i-lucide-x"
                @click="editState.rating = null"
              >
                Clear
              </UButton>
            </div>
          </UFormGroup>

          <UFormGroup label="Categories" name="categoryIds">
            <USelectMenu
              v-model="editState.categoryIds"
              :options="categories"
              value-attribute="id"
              option-attribute="name"
              multiple
              :placeholder="editState.categoryIds.length === 0 ? 'Select categories' : `${editState.categoryIds.length} selected`"
            />
          </UFormGroup>

          <div class="flex gap-4 pt-4">
            <UButton
              type="button"
              variant="outline"
              block
              :disabled="saving"
              @click="editModal = false"
            >
              Cancel
            </UButton>
            <UButton
              type="submit"
              block
              :loading="saving"
              :disabled="saving"
            >
              Save Changes
            </UButton>
          </div>
        </UForm>
      </template>
    </UModal>
  </div>
</template>