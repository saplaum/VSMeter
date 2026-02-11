<template>
  <div class="results-container py-8">
    <div
      v-for="(option, index) in sortedOptions"
      :key="option.label"
      class="result-item mb-8"
    >
      <!-- Percentage Label -->
      <div class="text-4xl font-bold text-center mb-3">
        {{ getPercentage(option.label) }}%
      </div>
      
      <!-- Bar Container -->
      <div class="relative h-32 bg-vs-dark-light rounded-xl overflow-hidden border border-vs-border">
        <div
          class="bar-gradient h-full rounded-xl result-bar transition-all duration-1000"
          :style="{ 
            width: getPercentage(option.label) + '%',
            animationDelay: (index * 0.1) + 's'
          }"
        ></div>
      </div>
      
      <!-- Option Label -->
      <div class="text-center mt-3">
        <span class="text-2xl">{{ option.emoji }}</span>
        <span class="text-lg text-vs-text-muted ml-2">{{ option.label }}</span>
        <span v-if="myVote === option.label" class="ml-2 text-vs-bar-accent">✓</span>
      </div>
    </div>
    
    <!-- Total Votes -->
    <div class="text-center mt-8 text-vs-text-muted">
      Gesamt: {{ totalVotes }} {{ totalVotes === 1 ? 'Stimme' : 'Stimmen' }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  options: {
    type: Array,
    required: true,
  },
  results: {
    type: Object,
    required: true,
  },
  totalVotes: {
    type: Number,
    required: true,
  },
  myVote: {
    type: String,
    default: null,
  },
});

const sortedOptions = computed(() => {
  return [...props.options].sort((a, b) => {
    const votesA = props.results[a.label] || 0;
    const votesB = props.results[b.label] || 0;
    return votesB - votesA;
  });
});

const getPercentage = (label) => {
  if (props.totalVotes === 0) return 0;
  const votes = props.results[label] || 0;
  return Math.round((votes / props.totalVotes) * 100);
};
</script>

<style scoped>
.result-bar {
  transform-origin: left;
  animation: growRight 1s ease-out forwards;
}

@keyframes growRight {
  from {
    width: 0 !important;
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
