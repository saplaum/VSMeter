import { ref, onUnmounted } from 'vue';

export function useTimer(delaySeconds) {
  const timeRemaining = ref(delaySeconds);
  const isActive = ref(false);
  const isComplete = ref(false);
  let intervalId = null;

  const start = () => {
    if (isActive.value) return;

    isActive.value = true;
    timeRemaining.value = delaySeconds;

    intervalId = setInterval(() => {
      timeRemaining.value--;

      if (timeRemaining.value <= 0) {
        complete();
      }
    }, 1000);
  };

  const complete = () => {
    isActive.value = false;
    isComplete.value = true;
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };

  const reset = () => {
    isActive.value = false;
    isComplete.value = false;
    timeRemaining.value = delaySeconds;
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };

  onUnmounted(() => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  });

  return {
    timeRemaining,
    isActive,
    isComplete,
    start,
    reset,
  };
}
