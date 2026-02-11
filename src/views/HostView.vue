<template>
  <div class="min-h-screen bg-vs-dark p-8">
    <div class="max-w-5xl mx-auto">
      <!-- Header -->
      <header class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h1 class="text-3xl font-bold mb-2">{{ config?.title || 'Loading...' }}</h1>
            <p class="text-vs-text-muted">{{ config?.description }}</p>
          </div>
          <ConnectionStatus :status="connectionStatus" />
        </div>
        <div class="text-sm text-vs-text-muted">
          Room: <span class="font-mono text-vs-bar-accent">{{ roomId }}</span>
        </div>
      </header>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-vs-bar-mid"></div>
        <p class="mt-4 text-vs-text-muted">Voting wird geladen...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="card text-center py-8">
        <p class="text-red-400 mb-4">{{ error }}</p>
        <router-link to="/" class="btn-secondary">
          Zurück zur Startseite
        </router-link>
      </div>

      <!-- Main Content -->
      <div v-else class="space-y-6">
        <!-- Share Link -->
        <ShareLink :url="voteUrl" />

        <!-- Stats Card -->
        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold mb-2">Teilnehmer</h3>
              <p class="text-3xl font-bold text-vs-bar-accent">
                {{ voteCount }} von {{ participantCount }}
              </p>
              <p class="text-vs-text-muted text-sm mt-1">haben abgestimmt</p>
            </div>
            
            <!-- Timer -->
            <div v-if="isActive && !resultsRevealed">
              <Timer :seconds="timeRemaining" message="bis Ergebnisse sichtbar" />
            </div>
            
            <div v-else-if="!isActive && !resultsRevealed" class="text-center">
              <p class="text-vs-text-muted">Warte auf erste Stimme...</p>
            </div>
          </div>
        </div>

        <!-- Results -->
        <div v-if="resultsRevealed" class="space-y-6">
          <div class="card">
            <h2 class="text-2xl font-bold mb-6 text-center">Ergebnisse</h2>
            <ResultChart
              :options="config.options"
              :results="results"
              :totalVotes="voteCount"
            />
          </div>

          <!-- Reset Button -->
          <div class="text-center">
            <button @click="handleReset" class="btn-secondary">
              Voting zurücksetzen
            </button>
          </div>
        </div>

        <!-- Waiting State -->
        <div v-else class="card text-center py-12">
          <div class="text-6xl mb-4">⏳</div>
          <p class="text-xl text-vs-text-muted">
            Warte auf Teilnehmer...
          </p>
          <p class="text-sm text-vs-text-muted mt-2">
            Timer startet automatisch bei der ersten Stimme
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useVotingConfig } from '../composables/useVotingConfig';
import { useWebRTCHost } from '../composables/useWebRTCHost';
import { useTimer } from '../composables/useTimer';
import ConnectionStatus from '../components/shared/ConnectionStatus.vue';
import ShareLink from '../components/shared/ShareLink.vue';
import Timer from '../components/shared/Timer.vue';
import ResultChart from '../components/shared/ResultChart.vue';

const props = defineProps({
  votingId: {
    type: String,
    required: true,
  },
});

const router = useRouter();
const { loadVoting } = useVotingConfig();

const config = ref(null);
const loading = ref(true);
const error = ref(null);

const resultsRevealed = ref(false);

// Load voting config
onMounted(async () => {
  try {
    config.value = await loadVoting(props.votingId);
    
    // Initialize WebRTC Host
    await initHost();
    
    loading.value = false;
  } catch (err) {
    error.value = err.message || 'Fehler beim Laden des Votings';
    loading.value = false;
  }
});

// WebRTC Host
const {
  roomId,
  connectionStatus,
  participantCount,
  voteCount,
  results,
  initHost,
  broadcastResults,
  reset,
} = useWebRTCHost(computed(() => config.value));

// Timer
const delaySeconds = computed(() => config.value?.delaySeconds || 30);
const { timeRemaining, isActive, isComplete, start: startTimer, reset: resetTimer } = useTimer(delaySeconds.value);

// Watch for first vote to start timer
watch(voteCount, (newCount, oldCount) => {
  if (newCount > 0 && oldCount === 0 && !isActive.value && !resultsRevealed.value) {
    console.log('First vote received, starting timer');
    startTimer();
  }
});

// Watch timer completion
watch(isComplete, (completed) => {
  if (completed && !resultsRevealed.value) {
    console.log('Timer complete, revealing results');
    resultsRevealed.value = true;
    broadcastResults();
  }
});

// Computed vote URL
const voteUrl = computed(() => {
  if (typeof window === 'undefined') return '';
  const baseUrl = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '');
  return `${baseUrl}/vote/${props.votingId}/${roomId.value}`;
});

const handleReset = () => {
  resultsRevealed.value = false;
  resetTimer();
  reset();
};
</script>
