<template>
  <div class="min-h-screen bg-vs-dark p-8">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <header class="mb-8 text-center">
        <h1 class="text-3xl font-bold mb-2">{{ config?.title || 'Loading...' }}</h1>
        <p class="text-vs-text-muted mb-4">{{ config?.description }}</p>
        <div class="flex flex-col items-center gap-3">
          <ConnectionStatus :status="connectionStatus" />
          <Timer 
            v-if="timerActive && !results"
            :seconds="timeRemaining" 
            message="until results visible"
          />
        </div>
      </header>

      <!-- Loading State -->
      <div v-if="loading || (connectionStatus === 'connecting' && !error)" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-vs-bar-mid"></div>
        <p class="mt-4 text-vs-text-muted">Connecting...</p>
        <p v-if="reconnectAttempts > 0" class="mt-2 text-sm text-vs-text-muted">
          Reconnection attempt {{ reconnectAttempts }}/20...
        </p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="card text-center py-8">
        <p class="text-red-400 mb-4">{{ error }}</p>
        <router-link to="/" class="btn-secondary">
          Back to Home
        </router-link>
      </div>

      <!-- Voting Active -->
      <div v-else-if="!results" class="space-y-6">
        <div class="card">
          <h2 class="text-xl font-semibold mb-6 text-center">Choose your option:</h2>
          
          <div class="flex justify-center gap-3 flex-nowrap overflow-x-auto">
            <VotingOption
              v-for="option in config.options"
              :key="option.label"
              :option="option"
              :selected="myVote === option.label"
              :disabled="connectionStatus !== 'connected' || !timerActive"
              @select="handleVote"
            />
          </div>
          
          <!-- Waiting for host message -->
          <div v-if="!timerActive && connectionStatus === 'connected'" class="mt-6 text-center">
            <div class="flex items-center justify-center gap-2 text-vs-text-muted text-lg">
              <Hourglass :size="20" :stroke-width="2" class="animate-pulse" />
              <span>Waiting for host to start voting...</span>
            </div>
          </div>
        </div>

        <!-- Vote Confirmation -->
        <div v-if="myVote" class="card text-center">
          <p class="text-vs-text-muted">
            Your choice: <span class="text-vs-bar-accent font-semibold">{{ myVote }}</span> ✓
          </p>
          <p class="text-sm text-vs-text-muted mt-2">
            You can still change your vote
          </p>
        </div>

        <!-- Waiting Info -->
        <div class="text-center text-vs-text-muted text-sm">
          <p>{{ participantCount }} participants connected</p>
          <p v-if="voteCount > 0">{{ voteCount }} have already voted</p>
        </div>
      </div>

      <!-- Results View -->
      <div v-else class="space-y-6">
        <div class="card">
          <h2 class="text-2xl font-bold mb-6 text-center">Results</h2>
          <ResultChart
            :options="config.options"
            :results="results"
            :totalVotes="Object.values(results).reduce((a, b) => a + b, 0)"
            :myVote="myVote"
          />
        </div>

        <div class="text-center text-vs-text-muted text-sm">
          <p>Voting completed</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useVotingConfig } from '../composables/useVotingConfig';
import { useWebRTCParticipant } from '../composables/useWebRTCParticipant';
import { Hourglass } from 'lucide-vue-next';
import ConnectionStatus from '../components/shared/ConnectionStatus.vue';
import Timer from '../components/shared/Timer.vue';
import VotingOption from '../components/vote/VotingOption.vue';
import ResultChart from '../components/shared/ResultChart.vue';

const props = defineProps({
  votingId: {
    type: String,
    required: true,
  },
  roomId: {
    type: String,
    required: true,
  },
});

const router = useRouter();
const { loadVoting } = useVotingConfig();

const config = ref(null);
const loading = ref(true);
const error = ref(null);

// WebRTC Participant - use full room ID with votingId prefix
const fullRoomId = `${props.votingId}-${props.roomId}`;

const {
  connectionStatus,
  myVote,
  results,
  participantCount,
  voteCount,
  timeRemaining,
  timerActive,
  reconnectAttempts,
  connect,
  vote,
} = useWebRTCParticipant(fullRoomId);

// Watch connection status to clear errors when connected
watch(connectionStatus, (newStatus) => {
  if (newStatus === 'connected') {
    error.value = null;
    loading.value = false;
  } else if (newStatus === 'error' && reconnectAttempts.value >= 20) {
    error.value = 'Could not connect to host after multiple attempts';
    loading.value = false;
  }
});

// Load voting config
onMounted(async () => {
  try {
    config.value = await loadVoting(props.votingId);
    
    // Start connection (don't await - it will retry in background)
    connect().catch(err => {
      // Only show error if we're not still trying to connect
      if (connectionStatus.value !== 'connecting') {
        error.value = err.message || 'Fehler beim Verbinden';
      }
    });
    
    loading.value = false;
  } catch (err) {
    error.value = err.message || 'Fehler beim Laden des Votings';
    loading.value = false;
  }
});

const handleVote = (optionLabel) => {
  vote(optionLabel);
};

// Watch for reset
watch(results, (newResults, oldResults) => {
  if (oldResults && !newResults) {
    // Reset detected
    console.log('Voting has been reset');
  }
});
</script>
