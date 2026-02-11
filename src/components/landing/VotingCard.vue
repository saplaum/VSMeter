<template>
  <div class="card hover:border-vs-bar-accent transition-all duration-200">
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <div class="flex items-center gap-3 mb-3">
          <span class="text-4xl">{{ voting.options[0]?.emoji || '📊' }}</span>
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
