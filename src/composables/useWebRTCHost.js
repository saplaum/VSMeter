import { ref, computed, onUnmounted } from 'vue';
import Peer from 'peerjs';
import { generateRoomId } from '../utils/roomId';
import { MESSAGE_TYPES, CONNECTION_STATUS } from '../utils/constants';

export function useWebRTCHost(votingConfig, customRoomId = null) {
  const peer = ref(null);
  const roomId = ref(customRoomId || generateRoomId());
  const connectionStatus = ref(CONNECTION_STATUS.DISCONNECTED);
  
  // Store peer connections
  const peers = ref(new Map());
  
  // Store votes: Map<peerId, votedOption>
  const votes = ref(new Map());
  
  // Computed
  const participantCount = computed(() => peers.value.size);
  const voteCount = computed(() => votes.value.size);
  
  // Aggregate results
  const results = computed(() => {
    const resultObj = {};
    
    // Initialize all options with 0
    const config = votingConfig.value;
    if (!config || !config.options) return resultObj;
    
    config.options.forEach(option => {
      resultObj[option.label] = 0;
    });
    
    // Count votes
    votes.value.forEach(vote => {
      if (resultObj[vote] !== undefined) {
        resultObj[vote]++;
      }
    });
    
    return resultObj;
  });

  const initHost = (newRoomId = null) => {
    return new Promise((resolve, reject) => {
      try {
        // Allow setting roomId at initialization time
        if (newRoomId) {
          roomId.value = newRoomId;
        }
        
        connectionStatus.value = CONNECTION_STATUS.CONNECTING;
        
        peer.value = new Peer(roomId.value, {
          debug: 2,
        });

        peer.value.on('open', (id) => {
          console.log('Host peer opened with ID:', id);
          connectionStatus.value = CONNECTION_STATUS.CONNECTED;
          resolve(id);
        });

        peer.value.on('connection', (conn) => {
          console.log('Participant connected:', conn.peer);
          
          peers.value.set(conn.peer, conn);

          conn.on('data', (data) => {
            handleMessage(conn.peer, data);
          });

          conn.on('close', () => {
            console.log('Participant disconnected:', conn.peer);
            peers.value.delete(conn.peer);
            votes.value.delete(conn.peer);
          });

          conn.on('error', (err) => {
            console.error('Connection error:', err);
          });
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

  const handleMessage = (peerId, data) => {
    console.log('Received message from', peerId, ':', data);
    
    switch (data.type) {
      case MESSAGE_TYPES.VOTE:
      case MESSAGE_TYPES.VOTE_UPDATE:
        votes.value.set(peerId, data.vote);
        broadcastState();
        break;
        
      case MESSAGE_TYPES.REQUEST_STATE:
        sendStateToPeer(peerId);
        break;
    }
  };

  const broadcastState = () => {
    const state = {
      type: MESSAGE_TYPES.STATE_UPDATE,
      participantCount: participantCount.value,
      voteCount: voteCount.value,
    };

    peers.value.forEach(conn => {
      if (conn.open) {
        conn.send(state);
      }
    });
  };

  const broadcastTimer = (timeRemaining, isActive) => {
    const message = {
      type: MESSAGE_TYPES.TIMER_UPDATE,
      timeRemaining,
      isActive,
    };

    peers.value.forEach(conn => {
      if (conn.open) {
        conn.send(message);
      }
    });
  };

  const broadcastTimerStart = () => {
    const message = {
      type: MESSAGE_TYPES.TIMER_START,
    };

    peers.value.forEach(conn => {
      if (conn.open) {
        conn.send(message);
      }
    });
  };

  const sendStateToPeer = (peerId) => {
    const conn = peers.value.get(peerId);
    if (conn && conn.open) {
      conn.send({
        type: MESSAGE_TYPES.STATE_UPDATE,
        participantCount: participantCount.value,
        voteCount: voteCount.value,
      });
    }
  };

  const broadcastResults = () => {
    const message = {
      type: MESSAGE_TYPES.RESULTS,
      results: results.value,
      totalVotes: voteCount.value,
    };

    console.log('Broadcasting results:', message);

    peers.value.forEach(conn => {
      if (conn.open) {
        conn.send(message);
      }
    });
  };

  const reset = () => {
    votes.value.clear();
    
    const message = {
      type: MESSAGE_TYPES.RESET,
      timestamp: Date.now(),
    };

    peers.value.forEach(conn => {
      if (conn.open) {
        conn.send(message);
      }
    });
  };

  const destroy = () => {
    if (peer.value) {
      peer.value.destroy();
      peer.value = null;
    }
    peers.value.clear();
    votes.value.clear();
    connectionStatus.value = CONNECTION_STATUS.DISCONNECTED;
  };

  onUnmounted(() => {
    destroy();
  });

  return {
    peer,
    roomId,
    connectionStatus,
    peers,
    votes,
    participantCount,
    voteCount,
    results,
    initHost,
    broadcastResults,
    broadcastState,
    broadcastTimer,
    broadcastTimerStart,
    reset,
    destroy,
  };
}
