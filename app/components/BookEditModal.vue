<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

interface Category {
  id: number
  name: string
  description?: string | null
}

interface BookEditModalProps {
  bookId: string | number
}

const props = defineProps<BookEditModalProps>()
const emits = defineEmits<{
  close: [value?: boolean]
}>()

const { token } = useAuth()
const toast = useToast()
const loading = ref(true)
const saving = ref(false)
const categories = ref<Category[]>([])

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  author: z.string().min(1, 'Author is required'),
  isbn: z.string().optional(),
  totalPages: z.number().min(1, 'Total pages must be at least 1'),
  currentPage: z.number().min(0).optional(),
  status: z.enum(['to_read', 'reading', 'completed', 'abandoned']),
  rating: z.number().min(1).max(5).optional().nullable(),
  categoryIds: z.array(z.number()).optional()
})

type Schema = z.output<typeof schema>

const state = reactive({
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

async function fetchData() {
  loading.value = true
  try {
    const [bookRes, categoriesRes] = await Promise.all([
      $fetch<any>(`/api/books/${props.bookId}`, {
        headers: { Authorization: `Bearer ${token.value}` }
      }),
      $fetch<any>('/api/categories', {
        headers: { Authorization: `Bearer ${token.value}` }
      })
    ])

    if (bookRes.success && bookRes.data) {
      state.title = bookRes.data.title
      state.author = bookRes.data.author
      state.isbn = bookRes.data.isbn || ''
      state.totalPages = bookRes.data.totalPages
      state.currentPage = bookRes.data.currentPage
      state.status = bookRes.data.status
      state.rating = bookRes.data.rating
      state.categoryIds = bookRes.data.categories?.map((c: Category) => c.id) || []
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
    emits('close', false)
  } finally {
    loading.value = false
  }
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  saving.value = true
  try {
    const res = await $fetch(`/api/books/${props.bookId}`, {
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
      emits('close', true)
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

onMounted(() => {
  fetchData()
})
</script>

<template>
  <UModal title="Edit Book" class="sm:max-w-2xl">
    <template #content>
      <div v-if="loading" class="p-8 text-center">
        <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin mx-auto" />
      </div>

      <UForm v-else :schema="schema" :state="state" @submit="onSubmit" class="p-6 space-y-6">
        <UFormGroup label="Title" name="title" required>
          <UInput
            v-model="state.title"
            placeholder="Enter book title"
            icon="i-lucide-book"
          />
        </UFormGroup>

        <UFormGroup label="Author" name="author" required>
          <UInput
            v-model="state.author"
            placeholder="Enter author name"
            icon="i-lucide-user"
          />
        </UFormGroup>

        <UFormGroup label="ISBN" name="isbn" description="Optional">
          <UInput
            v-model="state.isbn"
            placeholder="978-3-16-148410-0"
            icon="i-lucide-barcode"
          />
        </UFormGroup>

        <div class="grid grid-cols-2 gap-4">
          <UFormGroup label="Total Pages" name="totalPages" required>
            <UInput
              v-model.number="state.totalPages"
              type="number"
              placeholder="0"
              icon="i-lucide-file-text"
            />
          </UFormGroup>

          <UFormGroup label="Current Page" name="currentPage">
            <UInput
              v-model.number="state.currentPage"
              type="number"
              placeholder="0"
              icon="i-lucide-bookmark"
            />
          </UFormGroup>
        </div>

        <UFormGroup label="Status" name="status" required>
          <USelectMenu
            v-model="state.status"
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
              :variant="state.rating && i <= state.rating ? 'solid' : 'outline'"
              :color="state.rating && i <= state.rating ? 'warning' : 'neutral'"
              size="sm"
              icon="i-lucide-star"
              @click="state.rating = i"
            />
            <UButton
              v-if="state.rating"
              variant="ghost"
              size="sm"
              icon="i-lucide-x"
              @click="state.rating = null"
            >
              Clear
            </UButton>
          </div>
        </UFormGroup>

        <UFormGroup label="Categories" name="categoryIds">
          <USelectMenu
            v-model="state.categoryIds"
            :options="categories"
            value-attribute="id"
            option-attribute="name"
            multiple
            :placeholder="state.categoryIds.length === 0 ? 'Select categories' : `${state.categoryIds.length} selected`"
          />
        </UFormGroup>

        <div class="flex gap-4 pt-4">
          <UButton
            type="button"
            variant="outline"
            block
            :disabled="saving"
            @click="emits('close', false)"
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
</template>
