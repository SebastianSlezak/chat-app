<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const { token } = useAuth()
const toast = useToast()
const loading = ref(false)

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  author: z.string().min(1, 'Author is required'),
  isbn: z.string().optional(),
  totalPages: z.number().min(1, 'Total pages must be at least 1'),
  status: z.enum(['to_read', 'reading', 'completed', 'abandoned'])
})

type Schema = z.output<typeof schema>

const state = reactive({
  title: '',
  author: '',
  isbn: '',
  totalPages: 0,
  status: 'to_read' as const
})

const statusOptions = [
  { label: 'To Read', value: 'to_read' },
  { label: 'Reading', value: 'reading' },
  { label: 'Completed', value: 'completed' },
  { label: 'Abandoned', value: 'abandoned' }
]

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true
  try {
    const res = await $fetch('/api/books', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}` },
      body: event.data
    })

    if (res.success) {
      toast.add({
        title: 'Success',
        description: 'Book added successfully',
        color: 'green'
      })
      navigateTo('/dashboard')
    }
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.data?.message || 'Failed to add book',
      color: 'red'
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center gap-4">
          <UButton to="/dashboard" variant="ghost" icon="i-lucide-arrow-left" size="sm">
            Back
          </UButton>
          <h1 class="text-2xl font-bold">Add New Book</h1>
        </div>
      </div>
    </header>

    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <UCard>
        <UForm :schema="schema" :state="state" @submit="onSubmit" class="space-y-6">
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

          <UFormGroup label="Total Pages" name="totalPages" required>
            <UInput
              v-model.number="state.totalPages"
              type="number"
              placeholder="0"
              icon="i-lucide-file-text"
            />
          </UFormGroup>

          <UFormGroup label="Status" name="status" required description="Select reading status">
            <USelectMenu
              v-model="state.status"
              :options="statusOptions"
              value-attribute="value"
              option-attribute="label"
            />
          </UFormGroup>

          <div class="flex gap-4">
            <UButton
              type="submit"
              block
              size="lg"
              :loading="loading"
              :disabled="loading"
            >
              Add Book
            </UButton>
            <UButton
              to="/dashboard"
              variant="soft"
              block
              size="lg"
              :disabled="loading"
            >
              Cancel
            </UButton>
          </div>
        </UForm>
      </UCard>
    </div>
  </div>
</template>