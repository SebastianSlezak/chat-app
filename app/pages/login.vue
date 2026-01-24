<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui'

const { login } = useAuth()
const toast = useToast()

const fields: AuthFormField[] = [
  {
    name: 'email',
    type: 'email',
    label: 'Email',
    placeholder: 'your.email@example.com',
    icon: 'i-lucide-mail',
    required: true
  },
  {
    name: 'password',
    type: 'password',
    label: 'Password',
    placeholder: 'Enter your password',
    icon: 'i-lucide-lock',
    required: true
  }
]

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
})

type Schema = z.output<typeof schema>

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    await login(event.data.email, event.data.password)
    toast.add({
      title: 'Success',
      description: 'Logged in successfully',
      color: 'primary'
    })
    navigateTo('/dashboard')
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message || 'Login failed',
      color: 'error'
    })
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
    <UPageCard class="w-full max-w-md">
      <UAuthForm
        :schema="schema"
        :fields="fields"
        title="BookTracker"
        description="Sign in to your account"
        icon="i-lucide-book-open"
        @submit="onSubmit"
      >
        <template #footer>
          <div class="text-center text-sm">
            Don't have an account?
            <ULink to="/register" class="text-primary font-medium">Sign up</ULink>
          </div>
        </template>
      </UAuthForm>
    </UPageCard>
  </div>
</template>