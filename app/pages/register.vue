<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const { register } = useAuth()
const toast = useToast()
const loading = ref(false)

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Please confirm your password')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

type Schema = z.output<typeof schema>

const state = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true
  try {
    await register(event.data.email, event.data.password, event.data.name)
    toast.add({
      title: 'Success',
      description: 'Account created successfully',
      color: 'green'
    })
    navigateTo('/dashboard')
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message || 'Registration failed',
      color: 'red'
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
    <UCard class="w-full max-w-md">
      <template #header>
        <div class="flex items-center gap-3">
          <UIcon name="i-lucide-book-open" class="w-8 h-8 text-primary" />
          <div>
            <h1 class="text-2xl font-bold">BookTracker</h1>
            <p class="text-sm text-gray-500 dark:text-gray-400">Create your account</p>
          </div>
        </div>
      </template>

      <UForm :schema="schema" :state="state" @submit="onSubmit" class="space-y-4">
        <UFormGroup label="Name" name="name" required>
          <UInput
            v-model="state.name"
            placeholder="Your name"
            icon="i-lucide-user"
          />
        </UFormGroup>

        <UFormGroup label="Email" name="email" required>
          <UInput
            v-model="state.email"
            type="email"
            placeholder="your.email@example.com"
            icon="i-lucide-mail"
          />
        </UFormGroup>

        <UFormGroup label="Password" name="password" required>
          <UInput
            v-model="state.password"
            type="password"
            placeholder="Create a password"
            icon="i-lucide-lock"
          />
        </UFormGroup>

        <UFormGroup label="Confirm Password" name="confirmPassword" required>
          <UInput
            v-model="state.confirmPassword"
            type="password"
            placeholder="Confirm your password"
            icon="i-lucide-lock"
          />
        </UFormGroup>

        <UButton
          type="submit"
          block
          size="lg"
          :loading="loading"
          :disabled="loading"
        >
          Create Account
        </UButton>
      </UForm>

      <template #footer>
        <div class="text-center text-sm">
          <span class="text-gray-500 dark:text-gray-400">Already have an account?</span>
          <UButton variant="link" to="/login" :padded="false" class="ml-1">
            Sign in
          </UButton>
        </div>
      </template>
    </UCard>
  </div>
</template>