<template>
  <div class="min-h-screen bg-vs-dark p-8">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <header class="text-center mb-12">
        <h1 class="text-5xl font-bold mb-4">VSMeter</h1>
        <p class="text-vs-text-muted text-lg">
          Anonymous live voting in real-time via Peer-to-Peer
        </p>
      </header>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-vs-bar-mid"></div>
        <p class="mt-4 text-vs-text-muted">Loading votings...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="card text-center py-8">
        <p class="text-red-400">Error loading votings: {{ error }}</p>
      </div>

      <!-- Votings List -->
      <div v-else class="space-y-6">
        <VotingCard
          v-for="voting in votings"
          :key="voting.id"
          :voting="voting"
        />
      </div>

      <!-- Info Section -->
      <div class="mt-16 text-center text-vs-text-muted text-sm">
        <p>No data storage • Peer-to-Peer • Open Source</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useVotingConfig } from '../composables/useVotingConfig';
import VotingCard from '../components/landing/VotingCard.vue';

const { votings, loading, error, loadVotings } = useVotingConfig();

onMounted(() => {
  loadVotings();
});
</script>
