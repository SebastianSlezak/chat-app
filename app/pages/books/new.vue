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
    color: 'gray'
  }
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
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
    <!-- Header -->
    <header class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-10">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div class="flex items-center gap-4">
          <UButton 
            to="/dashboard" 
            variant="ghost" 
            icon="i-lucide-arrow-left" 
            size="lg"
            class="hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Back
          </UButton>
          <div>
            <h1 class="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Add New Book
            </h1>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Fill in the details to add a new book to your library
            </p>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <UCard 
        class="shadow-xl ring-1 ring-gray-200/50 dark:ring-gray-700/50"
        :ui="{
          body: { padding: 'p-8 sm:p-10' },
          background: 'bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg'
        }"
      >
        <UForm :schema="schema" :state="state" @submit="onSubmit" class="space-y-8">
          <!-- Book Info Section -->
          <div class="space-y-6">
            <div class="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
              <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <UIcon name="i-lucide-book" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                Book Information
              </h2>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <UFormGroup 
                label="Title" 
                name="title" 
                required
                :ui="{ label: { base: 'font-semibold text-gray-700 dark:text-gray-300' } }"
              >
                <UInput
                  v-model="state.title"
                  placeholder="The Great Gatsby"
                  icon="i-lucide-book"
                  size="lg"
                  :ui="{ 
                    base: 'transition-all',
                    icon: { trailing: { pointer: '' } }
                  }"
                />
              </UFormGroup>

              <UFormGroup 
                label="Author" 
                name="author" 
                required
                :ui="{ label: { base: 'font-semibold text-gray-700 dark:text-gray-300' } }"
              >
                <UInput
                  v-model="state.author"
                  placeholder="F. Scott Fitzgerald"
                  icon="i-lucide-user"
                  size="lg"
                />
              </UFormGroup>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <UFormGroup 
                label="ISBN" 
                name="isbn" 
                description="Optional - for cataloging"
                :ui="{ label: { base: 'font-semibold text-gray-700 dark:text-gray-300' } }"
              >
                <UInput
                  v-model="state.isbn"
                  placeholder="978-3-16-148410-0"
                  icon="i-lucide-barcode"
                  size="lg"
                />
              </UFormGroup>

              <UFormGroup 
                label="Total Pages" 
                name="totalPages" 
                required
                :ui="{ label: { base: 'font-semibold text-gray-700 dark:text-gray-300' } }"
              >
                <UInput
                  v-model.number="state.totalPages"
                  type="number"
                  placeholder="218"
                  icon="i-lucide-file-text"
                  size="lg"
                />
              </UFormGroup>
            </div>
          </div>

          <!-- Status Section -->
          <div class="space-y-6">
            <div class="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
              <div class="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <UIcon name="i-lucide-list-checks" class="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                Reading Status
              </h2>
            </div>

            <UFormGroup 
              label="Current Status" 
              name="status" 
              required
              :ui="{ label: { base: 'font-semibold text-gray-700 dark:text-gray-300 mb-4' } }"
            >
              <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  v-for="option in statusOptions"
                  :key="option.value"
                  type="button"
                  @click="state.status = option.value"
                  class="group relative p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105"
                  :class="[
                    state.status === option.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg shadow-blue-500/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                  ]"
                >
                  <div class="flex flex-col items-center gap-2 text-center">
                    <div 
                      class="p-2.5 rounded-lg transition-colors"
                      :class="[
                        state.status === option.value
                          ? 'bg-blue-100 dark:bg-blue-800/40'
                          : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'
                      ]"
                    >
                      <UIcon 
                        :name="option.icon" 
                        class="w-6 h-6"
                        :class="[
                          state.status === option.value
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-gray-600 dark:text-gray-400'
                        ]"
                      />
                    </div>
                    <span 
                      class="text-sm font-medium"
                      :class="[
                        state.status === option.value
                          ? 'text-blue-700 dark:text-blue-300'
                          : 'text-gray-700 dark:text-gray-300'
                      ]"
                    >
                      {{ option.label }}
                    </span>
                  </div>
                  <div 
                    v-if="state.status === option.value"
                    class="absolute top-2 right-2"
                  >
                    <UIcon 
                      name="i-lucide-check-circle-2" 
                      class="w-5 h-5 text-blue-600 dark:text-blue-400"
                    />
                  </div>
                </button>
              </div>
            </UFormGroup>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <UButton
              type="submit"
              block
              size="xl"
              :loading="loading"
              :disabled="loading"
              icon="i-lucide-plus-circle"
              class="shadow-lg hover:shadow-xl transition-shadow"
            >
              <span class="font-semibold">Add Book to Library</span>
            </UButton>
            <UButton
              to="/dashboard"
              variant="soft"
              block
              size="xl"
              :disabled="loading"
              icon="i-lucide-x"
              color="gray"
            >
              <span class="font-semibold">Cancel</span>
            </UButton>
          </div>
        </UForm>
      </UCard>

      <!-- Quick Tips Card -->
      <UCard 
        class="mt-6 shadow-md"
        :ui="{
          body: { padding: 'p-6' },
          background: 'bg-blue-50/50 dark:bg-blue-900/10 backdrop-blur-lg'
        }"
      >
        <div class="flex items-start gap-4">
          <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
            <UIcon name="i-lucide-lightbulb" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 class="font-semibold text-gray-900 dark:text-white mb-2">
              Quick Tips
            </h3>
            <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• The ISBN is optional but helps with book identification</li>
              <li>• You can change the reading status at any time from your dashboard</li>
              <li>• Total pages help track your reading progress</li>
            </ul>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>