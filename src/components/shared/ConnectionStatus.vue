<template>
  <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
       :class="statusClass">
    <span class="w-2 h-2 rounded-full animate-pulse" :class="dotClass"></span>
    {{ statusText }}
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { CONNECTION_STATUS } from '../../utils/constants';

const props = defineProps({
  status: {
    type: String,
    required: true,
    validator: (value) => Object.values(CONNECTION_STATUS).includes(value),
  },
});

const statusClass = computed(() => {
  switch (props.status) {
    case CONNECTION_STATUS.CONNECTED:
      return 'bg-green-500 bg-opacity-20 text-green-400 border border-green-500';
    case CONNECTION_STATUS.CONNECTING:
      return 'bg-yellow-500 bg-opacity-20 text-yellow-400 border border-yellow-500';
    case CONNECTION_STATUS.ERROR:
      return 'bg-red-500 bg-opacity-20 text-red-400 border border-red-500';
    default:
      return 'bg-gray-500 bg-opacity-20 text-gray-400 border border-gray-500';
  }
});

const dotClass = computed(() => {
  switch (props.status) {
    case CONNECTION_STATUS.CONNECTED:
      return 'bg-green-400';
    case CONNECTION_STATUS.CONNECTING:
      return 'bg-yellow-400';
    case CONNECTION_STATUS.ERROR:
      return 'bg-red-400';
    default:
      return 'bg-gray-400';
  }
});

const statusText = computed(() => {
  switch (props.status) {
    case CONNECTION_STATUS.CONNECTED:
      return 'Connected';
    case CONNECTION_STATUS.CONNECTING:
      return 'Connecting...';
    case CONNECTION_STATUS.ERROR:
      return 'Error';
    default:
      return 'Disconnected';
  }
});
</script>
