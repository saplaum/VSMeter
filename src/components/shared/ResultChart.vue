<template>
  <div class="results-container py-8">
    <div class="flex justify-center items-end gap-6 md:gap-8">
      <div
        v-for="(option, index) in sortedOptions"
        :key="option.label"
        class="result-item flex flex-col items-center"
      >
        <!-- My Vote Indicator (above percentage) -->
        <div class="h-8 flex items-center justify-center mb-1">
          <div v-if="myVote === option.label" class="text-vs-bar-accent text-2xl">✓</div>
        </div>
        
        <!-- Percentage Label -->
        <div class="text-3xl font-bold text-center mb-3">
          {{ getPercentage(option.label) }}%
        </div>
        
        <!-- Bar Container (Vertical) -->
        <div class="relative w-16 md:w-20 h-64 bg-vs-dark-light rounded-xl overflow-hidden border border-vs-border flex items-end">
          <div
            class="bar-gradient w-full rounded-xl result-bar"
            :style="{ 
              height: getPercentage(option.label) + '%',
              animationDelay: (index * 0.1) + 's'
            }"
          ></div>
        </div>
        
        <!-- Option Label -->
        <div class="text-center mt-4">
          <div class="text-3xl mb-1">{{ option.emoji }}</div>
          <div class="text-xs md:text-sm text-vs-text-muted">{{ option.label }}</div>
        </div>
      </div>
    </div>
    
    <!-- Total Votes -->
    <div class="text-center mt-8 text-vs-text-muted">
      Total: {{ totalVotes }} {{ totalVotes === 1 ? 'Vote' : 'Votes' }}
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
  transform-origin: bottom;
  animation: growUp 1s ease-out forwards;
}

@keyframes growUp {
  from {
    height: 0 !important;
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
