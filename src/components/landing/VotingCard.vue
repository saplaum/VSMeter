<template>
  <div class="card hover:border-vs-bar-accent transition-all duration-200">
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <div class="flex items-center gap-3 mb-3">
          <svg class="w-10 h-10 text-vs-bar-mid flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
          </svg>
          <h2 class="text-2xl font-semibold">{{ voting.title }}</h2>
        </div>
        <p class="text-vs-text-muted mb-4">{{ voting.description }}</p>
        <div class="flex items-center gap-4 text-sm text-vs-text-muted">
          <span>{{ voting.options?.length || 0 }} Options</span>
          <span>•</span>
          <span>{{ voting.delaySeconds }}s Timer</span>
        </div>
      </div>
    </div>
    
    <div class="mt-6">
      <router-link
        :to="{ name: 'Host', params: { votingId: voting.id } }"
        class="btn-primary inline-block text-center w-full"
      >
        Start as Host →
      </router-link>
    </div>
  </div>
</template>

<script setup>
defineProps({
  voting: {
    type: Object,
    required: true,
  },
});
</script>
