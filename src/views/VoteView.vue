<template>
  <div class="min-h-screen bg-vs-dark p-8">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <header class="mb-8 text-center">
        <h1 class="text-3xl font-bold mb-2">{{ config?.title || 'Loading...' }}</h1>
        <p class="text-vs-text-muted mb-4">{{ config?.description }}</p>
        <div class="flex items-center justify-center gap-4">
          <ConnectionStatus :status="connectionStatus" />
          <Timer 
            v-if="!results && connectionStatus === 'connected'"
            :seconds="30" 
            message=""
          />
        </div>
      </header>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-vs-bar-mid"></div>
        <p class="mt-4 text-vs-text-muted">Verbinde...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="card text-center py-8">
        <p class="text-red-400 mb-4">{{ error }}</p>
        <router-link to="/" class="btn-secondary">
          Zurück zur Startseite
        </router-link>
      </div>

      <!-- Voting Active -->
      <div v-else-if="!results" class="space-y-6">
        <div class="card">
          <h2 class="text-xl font-semibold mb-6 text-center">Wähle deine Option:</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <VotingOption
              v-for="option in config.options"
              :key="option.label"
              :option="option"
              :selected="myVote === option.label"
              :disabled="connectionStatus !== 'connected'"
              @select="handleVote"
            />
          </div>
        </div>

        <!-- Vote Confirmation -->
        <div v-if="myVote" class="card text-center">
          <p class="text-vs-text-muted">
            Deine Wahl: <span class="text-vs-bar-accent font-semibold">{{ myVote }}</span> ✓
          </p>
          <p class="text-sm text-vs-text-muted mt-2">
            Du kannst deine Wahl noch ändern
          </p>
        </div>

        <!-- Waiting Info -->
        <div class="text-center text-vs-text-muted text-sm">
          <p>{{ participantCount }} Teilnehmer verbunden</p>
          <p v-if="voteCount > 0">{{ voteCount }} haben bereits abgestimmt</p>
        </div>
      </div>

      <!-- Results View -->
      <div v-else class="space-y-6">
        <div class="card">
          <h2 class="text-2xl font-bold mb-6 text-center">Ergebnisse</h2>
          <ResultChart
            :options="config.options"
            :results="results"
            :totalVotes="Object.values(results).reduce((a, b) => a + b, 0)"
            :myVote="myVote"
          />
        </div>

        <div class="text-center text-vs-text-muted text-sm">
          <p>Voting abgeschlossen</p>
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

// Load voting config
onMounted(async () => {
  try {
    config.value = await loadVoting(props.votingId);
    
    // Connect to host
    await connect();
    
    loading.value = false;
  } catch (err) {
    error.value = err.message || 'Fehler beim Verbinden';
    loading.value = false;
  }
});

// WebRTC Participant
const {
  connectionStatus,
  myVote,
  results,
  participantCount,
  voteCount,
  connect,
  vote,
} = useWebRTCParticipant(props.roomId);

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
