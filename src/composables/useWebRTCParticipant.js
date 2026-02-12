import { ref, onUnmounted } from 'vue';
import Peer from 'peerjs';
import { MESSAGE_TYPES, CONNECTION_STATUS } from '../utils/constants';

export function useWebRTCParticipant(roomId) {
  const peer = ref(null);
  const connection = ref(null);
  const connectionStatus = ref(CONNECTION_STATUS.DISCONNECTED);
  
  const myVote = ref(null);
  const results = ref(null);
  const participantCount = ref(0);
  const voteCount = ref(0);
  const timeRemaining = ref(0);
  const timerActive = ref(false);
  
  // Reconnection logic
  const reconnectAttempts = ref(0);
  const maxReconnectAttempts = 20; // Try for ~2 minutes
  const reconnectTimer = ref(null);

  const connect = () => {
    return new Promise((resolve, reject) => {
      try {
        connectionStatus.value = CONNECTION_STATUS.CONNECTING;
        
        peer.value = new Peer({
          debug: 2,
        });

        peer.value.on('open', (id) => {
          console.log('Participant peer opened with ID:', id);
          
          attemptConnection(resolve, reject);
        });

        peer.value.on('error', (err) => {
          console.error('Peer error:', err);
          connectionStatus.value = CONNECTION_STATUS.ERROR;
          reject(err);
        });
      } catch (err) {
        connectionStatus.value = CONNECTION_STATUS.ERROR;
        reject(err);
      }
    });
  };

  const attemptConnection = (resolve, reject) => {
    // Connect to host
    connection.value = peer.value.connect(roomId);

    const connectionTimeout = setTimeout(() => {
      if (connectionStatus.value !== CONNECTION_STATUS.CONNECTED) {
        console.log('Connection attempt timed out, retrying...');
        scheduleReconnect(resolve, reject);
      }
    }, 5000); // 5 second timeout

    connection.value.on('open', () => {
      clearTimeout(connectionTimeout);
      console.log('Connected to host');
      connectionStatus.value = CONNECTION_STATUS.CONNECTED;
      reconnectAttempts.value = 0; // Reset counter on success
      
      // Request current state
      connection.value.send({
        type: MESSAGE_TYPES.REQUEST_STATE,
      });
      
      resolve(peer.value.id);
    });

    connection.value.on('data', (data) => {
      handleMessage(data);
    });

    connection.value.on('close', () => {
      console.log('Connection to host closed');
      connectionStatus.value = CONNECTION_STATUS.DISCONNECTED;
    });

    connection.value.on('error', (err) => {
      clearTimeout(connectionTimeout);
      console.error('Connection error:', err);
      scheduleReconnect(resolve, reject);
    });
  };

  const scheduleReconnect = (resolve, reject) => {
    if (reconnectAttempts.value >= maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      connectionStatus.value = CONNECTION_STATUS.ERROR;
      reject(new Error('Could not connect to host after multiple attempts'));
      return;
    }

    reconnectAttempts.value++;
    const delay = Math.min(1000 * Math.pow(1.5, reconnectAttempts.value), 10000); // Exponential backoff, max 10s
    
    console.log(`Reconnection attempt ${reconnectAttempts.value}/${maxReconnectAttempts} in ${Math.round(delay/1000)}s...`);
    connectionStatus.value = CONNECTION_STATUS.CONNECTING;

    reconnectTimer.value = setTimeout(() => {
      attemptConnection(resolve, reject);
    }, delay);
  };

  const handleMessage = (data) => {
    console.log('Received message:', data);
    
    switch (data.type) {
      case MESSAGE_TYPES.STATE_UPDATE:
        participantCount.value = data.participantCount || 0;
        voteCount.value = data.voteCount || 0;
        break;
        
      case MESSAGE_TYPES.TIMER_UPDATE:
        timeRemaining.value = data.timeRemaining || 0;
        timerActive.value = data.isActive || false;
        break;
        
      case MESSAGE_TYPES.TIMER_START:
        timerActive.value = true;
        break;
        
      case MESSAGE_TYPES.RESULTS:
        results.value = data.results;
        timerActive.value = false;
        break;
        
      case MESSAGE_TYPES.RESET:
        myVote.value = null;
        results.value = null;
        participantCount.value = 0;
        voteCount.value = 0;
        timeRemaining.value = 0;
        timerActive.value = false;
        break;
    }
  };

  const vote = (option) => {
    if (!connection.value || !connection.value.open) {
      console.error('Not connected to host');
      return;
    }

    const isUpdate = myVote.value !== null;
    myVote.value = option;

    const message = {
      type: isUpdate ? MESSAGE_TYPES.VOTE_UPDATE : MESSAGE_TYPES.VOTE,
      peerId: peer.value?.id,
      vote: option,
      timestamp: Date.now(),
    };

    console.log('Sending vote:', message);
    connection.value.send(message);
  };

  const destroy = () => {
    // Clear reconnection timer
    if (reconnectTimer.value) {
      clearTimeout(reconnectTimer.value);
      reconnectTimer.value = null;
    }
    
    if (connection.value) {
      connection.value.close();
      connection.value = null;
    }
    if (peer.value) {
      peer.value.destroy();
      peer.value = null;
    }
    connectionStatus.value = CONNECTION_STATUS.DISCONNECTED;
    reconnectAttempts.value = 0;
  };

  onUnmounted(() => {
    destroy();
  });

  return {
    peer,
    connection,
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
    destroy,
  };
}
