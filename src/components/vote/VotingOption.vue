<template>
  <button
    class="voting-option"
    :class="{ 
      'selected': selected,
      'disabled': disabled 
    }"
    @click="$emit('select', option.label)"
    :disabled="disabled"
  >
    <span class="text-5xl">{{ option.emoji }}</span>
    <span class="text-xl font-medium">{{ option.label }}</span>
  </button>
</template>

<script setup>
defineProps({
  option: {
    type: Object,
    required: true,
  },
  selected: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['select']);
</script>
