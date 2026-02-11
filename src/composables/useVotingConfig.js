import { ref } from 'vue';
import matter from 'gray-matter';

// Load and parse voting configuration from markdown files
export function useVotingConfig() {
  const votings = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // Load all voting configs from /public/votings/
  const loadVotings = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      // In production (GitHub Pages), we need to manually list the files
      // For now, we'll hardcode voting1 and voting2
      const votingIds = ['voting1', 'voting2'];
      const loadedVotings = [];

      for (const id of votingIds) {
        try {
          const response = await fetch(`/votings/${id}.md`);
          if (response.ok) {
            const content = await response.text();
            const { data } = matter(content);
            loadedVotings.push(data);
          }
        } catch (err) {
          console.error(`Failed to load ${id}:`, err);
        }
      }

      votings.value = loadedVotings;
    } catch (err) {
      error.value = err.message;
      console.error('Error loading votings:', err);
    } finally {
      loading.value = false;
    }
  };

  // Load a single voting config
  const loadVoting = async (votingId) => {
    try {
      const response = await fetch(`/votings/${votingId}.md`);
      if (!response.ok) {
        throw new Error(`Voting ${votingId} not found`);
      }
      
      const content = await response.text();
      const { data } = matter(content);
      return data;
    } catch (err) {
      console.error(`Error loading voting ${votingId}:`, err);
      throw err;
    }
  };

  return {
    votings,
    loading,
    error,
    loadVotings,
    loadVoting,
  };
}
