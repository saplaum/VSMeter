<template>
  <div class="flex items-center justify-center gap-3">
    <div class="text-center">
      <div class="text-5xl font-bold text-vs-bar-accent mb-2">
        {{ displayTime }}
      </div>
      <div class="text-vs-text-muted text-sm">
        {{ message }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  seconds: {
    type: Number,
    required: true,
  },
  message: {
    type: String,
    default: 'bis Ergebnisse sichtbar',
  },
});

const displayTime = computed(() => {
  const mins = Math.floor(props.seconds / 60);
  const secs = props.seconds % 60;
  
  if (mins > 0) {
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  return `${secs}s`;
});
</script>
