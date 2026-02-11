<template>
  <div class="card">
    <h3 class="text-lg font-semibold mb-4">Voting-Link teilen</h3>
    <div class="flex gap-3">
      <input
        type="text"
        :value="url"
        readonly
        class="flex-1 bg-vs-dark border border-vs-border rounded-lg px-4 py-3 text-vs-text font-mono text-sm"
        @click="selectAll"
      />
      <button
        @click="copyToClipboard"
        class="btn-primary whitespace-nowrap"
        :class="{ 'opacity-50': copied }"
      >
        {{ copied ? '✓ Kopiert' : 'Kopieren' }}
      </button>
    </div>
    <p class="text-vs-text-muted text-sm mt-3">
      Teile diesen Link mit allen Teilnehmern
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  url: {
    type: String,
    required: true,
  },
});

const copied = ref(false);

const selectAll = (event) => {
  event.target.select();
};

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(props.url);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};
</script>
