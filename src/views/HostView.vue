<template>
  <div class="min-h-screen bg-vs-dark p-8">
    <div class="max-w-5xl mx-auto">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-vs-bar-mid"></div>
        <p class="mt-4 text-vs-text-muted">Loading voting...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="card text-center py-8">
        <p class="text-red-400 mb-4">{{ error }}</p>
        <router-link to="/" class="btn-secondary">
          Back to Home
        </router-link>
      </div>

      <!-- Room Setup Screen (before connection) -->
      <div v-else-if="!hostInitialized" class="space-y-6">
        <div class="mb-8">
          <h1 class="text-3xl font-bold mb-2">{{ config?.title || 'Loading...' }}</h1>
          <p class="text-vs-text-muted">{{ config?.description }}</p>
        </div>

        <div class="card max-w-2xl mx-auto">
          <h2 class="text-xl font-semibold mb-6">Room Setup</h2>
          
          <div class="space-y-6">
            <!-- Random Room ID Option -->
            <div class="space-y-3">
              <label class="flex items-center space-x-3 cursor-pointer hover:bg-gray-800 p-3 rounded-lg transition-colors">
                <input 
                  type="radio" 
                  v-model="roomIdMode" 
                  value="random"
                  class="w-5 h-5 text-blue-500 bg-gray-700 border-gray-600 focus:ring-blue-500 focus:ring-2"
                />
                <span class="text-lg font-medium">Generate random room ID</span>
              </label>
              <p class="text-vs-text-muted text-sm ml-11">
                A new random room ID will be created (e.g., ABC-123)
              </p>
            </div>

            <!-- Custom Room ID Option -->
            <div class="space-y-3">
              <label class="flex items-center space-x-3 cursor-pointer hover:bg-gray-800 p-3 rounded-lg transition-colors">
                <input 
                  type="radio" 
                  v-model="roomIdMode" 
                  value="custom"
                  class="w-5 h-5 text-blue-500 bg-gray-700 border-gray-600 focus:ring-blue-500 focus:ring-2"
                />
                <span class="text-lg font-medium">Enter existing room ID</span>
              </label>
              <p class="text-vs-text-muted text-sm ml-11">
                Reuse a room ID you've already shared with participants
              </p>
              
              <div v-if="roomIdMode === 'custom'" class="ml-11 mt-3">
                <input 
                  v-model="customRoomIdInput"
                  type="text"
                  placeholder="e.g., ABC-123"
                  class="w-full px-4 py-3 bg-gray-800 border-2 border-gray-600 rounded-lg text-white font-mono text-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-colors"
                  @input="formatRoomIdInput"
                  maxlength="7"
                />
                <p v-if="roomIdError" class="text-red-400 text-sm mt-2">{{ roomIdError }}</p>
              </div>
            </div>

            <!-- Create Room Button -->
            <div class="pt-4">
              <button 
                @click="handleCreateRoom" 
                class="btn-primary w-full"
                :disabled="isCreatingRoom || (roomIdMode === 'custom' && !isValidRoomId)"
              >
                {{ isCreatingRoom ? 'Creating room...' : 'Create Room & Start Session' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content (after connection established) -->
      <div v-else>
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

        <div class="space-y-6">
          <!-- Share Link -->
          <ShareLink :url="voteUrl" />

          <!-- Stats Card -->
          <div class="card">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-semibold mb-2">Participants</h3>
                <p class="text-3xl font-bold text-vs-bar-accent">
                  {{ voteCount }} of {{ participantCount }}
                </p>
                <p class="text-vs-text-muted text-sm mt-1">have voted</p>
              </div>
              
              <!-- Timer -->
              <div v-if="isActive && !resultsRevealed">
                <Timer :seconds="timeRemaining" message="until results visible" />
              </div>
              
              <!-- Start Button -->
              <div v-else-if="!isActive && !resultsRevealed" class="text-center">
                <button 
                  @click="handleStartVoting" 
                  class="btn-primary"
                  :disabled="participantCount === 0"
                >
                  Start Voting
                </button>
                <p class="text-vs-text-muted text-sm mt-2">
                  {{ participantCount === 0 ? 'Waiting for participants...' : `${participantCount} participants connected` }}
                </p>
              </div>
            </div>
          </div>

          <!-- Results -->
          <div v-if="resultsRevealed" class="space-y-6">
            <div class="card">
              <h2 class="text-2xl font-bold mb-6 text-center">Results</h2>
              <ResultChart
                :options="config.options"
                :results="results"
                :totalVotes="voteCount"
              />
            </div>

            <!-- Reset Button -->
            <div class="text-center">
              <button @click="handleReset" class="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200">
                🔄 Reset Voting & Start New Round
              </button>
              <p class="text-vs-text-muted text-sm mt-2">
                This will clear all votes and start a new voting session
              </p>
            </div>
          </div>

          <!-- Reset Button During Active Voting -->
          <div v-else-if="isActive || voteCount > 0" class="text-center">
            <button 
              @click="handleReset" 
              class="text-vs-text-muted hover:text-red-400 text-sm transition-colors"
            >
              Reset Voting
            </button>
          </div>

          <!-- Waiting State -->
          <div v-else class="card text-center py-12">
            <div class="text-6xl mb-4">⏳</div>
            <p class="text-xl text-vs-text-muted">
              Waiting for participants...
            </p>
            <p class="text-sm text-vs-text-muted mt-2">
              Timer starts automatically with first vote or manually
            </p>
          </div>
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
const hostInitialized = ref(false);
const isCreatingRoom = ref(false);

// Room ID setup
const roomIdMode = ref('random');
const customRoomIdInput = ref('');
const roomIdError = ref('');

// Load voting config
onMounted(async () => {
  try {
    config.value = await loadVoting(props.votingId);
    loading.value = false;
  } catch (err) {
    error.value = err.message || 'Fehler beim Laden des Votings';
    loading.value = false;
  }
});

// Validate room ID format (XXX-YYY) - alphanumeric
const isValidRoomId = computed(() => {
  if (roomIdMode.value === 'random') return true;
  const trimmed = customRoomIdInput.value.trim();
  return /^[A-Z0-9]{3}-[A-Z0-9]{3}$/.test(trimmed);
});

// Format room ID input
const formatRoomIdInput = () => {
  let value = customRoomIdInput.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
  
  // Auto-add hyphen after 3 characters
  if (value.length >= 3 && value[3] !== '-') {
    value = value.slice(0, 3) + '-' + value.slice(3);
  }
  
  customRoomIdInput.value = value.slice(0, 7);
  
  // Update error message
  if (customRoomIdInput.value.length > 0 && !isValidRoomId.value) {
    roomIdError.value = 'Format: ABC-123 (3 characters, hyphen, 3 characters)';
  } else {
    roomIdError.value = '';
  }
};

// Create room and initialize host
const handleCreateRoom = async () => {
  if (isCreatingRoom.value) return;
  
  isCreatingRoom.value = true;
  
  try {
    const roomIdToUse = roomIdMode.value === 'custom' 
      ? customRoomIdInput.value.trim() 
      : null;
    
    await initHost(roomIdToUse);
    hostInitialized.value = true;
  } catch (err) {
    error.value = 'Failed to create room: ' + err.message;
  } finally {
    isCreatingRoom.value = false;
  }
};

// WebRTC Host
const {
  roomId,
  connectionStatus,
  participantCount,
  voteCount,
  results,
  initHost,
  broadcastResults,
  broadcastTimer,
  broadcastTimerStart,
  reset,
} = useWebRTCHost(computed(() => config.value));

// Timer
const delaySeconds = computed(() => config.value?.delaySeconds || 30);
const { timeRemaining, isActive, isComplete, start: startTimer, reset: resetTimer } = useTimer(delaySeconds.value);

// Broadcast timer updates to all participants
watch(timeRemaining, (newTime) => {
  if (isActive.value) {
    broadcastTimer(newTime, true);
  }
});

// Manual start function
const handleStartVoting = () => {
  if (!isActive.value && !resultsRevealed.value) {
    console.log('Manually starting timer');
    startTimer();
    broadcastTimerStart();
  }
};

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
  // Use router to get the base URL properly
  const baseUrl = window.location.origin + import.meta.env.BASE_URL;
  return `${baseUrl}vote/${props.votingId}/${roomId.value}`;
});

const handleReset = () => {
  if (confirm('Are you sure you want to reset the voting? All current votes will be lost.')) {
    resultsRevealed.value = false;
    resetTimer();
    reset();
  }
};
</script>
