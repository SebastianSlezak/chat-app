<script setup lang="ts">
const { isAuthenticated } = useAuth()

onMounted(() => {
  if (isAuthenticated.value) {
    navigateTo('/dashboard')
  }
})

const features = [
  {
    icon: 'i-lucide-book-open',
    title: 'Track Your Reading',
    description: 'Keep track of all your books and reading progress in one place'
  },
  {
    icon: 'i-lucide-target',
    title: 'Set Goals',
    description: 'Set yearly reading goals and monitor your achievements'
  },
  {
    icon: 'i-lucide-bar-chart',
    title: 'View Statistics',
    description: 'Get insights into your reading habits with detailed statistics'
  },
  {
    icon: 'i-lucide-star',
    title: 'Rate & Review',
    description: 'Rate books and write reviews to remember your thoughts'
  },
  {
    icon: 'i-lucide-tag',
    title: 'Organize by Category',
    description: 'Categorize your books by genre for easy organization'
  },
  {
    icon: 'i-lucide-trending-up',
    title: 'Track Progress',
    description: 'Monitor your reading progress page by page'
  }
]
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
    <!-- Hero Section -->
    <div class="relative overflow-hidden">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div class="text-center">
          <div class="flex justify-center mb-8">
            <UIcon name="i-lucide-book-open" class="w-20 h-20 text-primary" />
          </div>
          <h1 class="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6">
            BookTracker
          </h1>
          <p class="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Track your reading journey, set goals, and discover insights about your reading habits
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <UButton to="/register" size="xl" icon="i-lucide-rocket">
              Get Started Free
            </UButton>
            <UButton to="/login" size="xl" variant="outline" icon="i-lucide-log-in">
              Sign In
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div class="text-center mb-16">
        <h2 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Everything You Need to Track Your Reading
        </h2>
        <p class="text-xl text-gray-600 dark:text-gray-300">
          Powerful features to help you become a better reader
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <UCard v-for="feature in features" :key="feature.title" class="hover:shadow-xl transition-shadow">
          <div class="text-center space-y-4">
            <div class="flex justify-center">
              <div class="p-4 bg-primary/10 rounded-full">
                <UIcon :name="feature.icon" class="w-10 h-10 text-primary" />
              </div>
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white">
              {{ feature.title }}
            </h3>
            <p class="text-gray-600 dark:text-gray-300">
              {{ feature.description }}
            </p>
          </div>
        </UCard>
      </div>
    </div>

    <!-- CTA Section -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <UCard class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div class="text-center py-12">
          <h2 class="text-4xl font-bold mb-4">
            Ready to Start Your Reading Journey?
          </h2>
          <p class="text-xl mb-8 opacity-90">
            Join thousands of readers tracking their books with BookTracker
          </p>
          <UButton to="/register" size="xl" color="white" variant="solid">
            Create Free Account
          </UButton>
        </div>
      </UCard>
    </div>

    <!-- Footer -->
    <footer class="border-t border-gray-200 dark:border-gray-700 mt-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex flex-col md:flex-row justify-between items-center gap-4">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-book-open" class="w-6 h-6 text-primary" />
            <span class="font-bold text-lg">BookTracker</span>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            © 2025 BookTracker. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>