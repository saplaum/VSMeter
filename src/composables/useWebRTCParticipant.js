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

  const connect = () => {
    return new Promise((resolve, reject) => {
      try {
        connectionStatus.value = CONNECTION_STATUS.CONNECTING;
        
        peer.value = new Peer({
          debug: 2,
        });

        peer.value.on('open', (id) => {
          console.log('Participant peer opened with ID:', id);
          
          // Connect to host
          connection.value = peer.value.connect(roomId);

          connection.value.on('open', () => {
            console.log('Connected to host');
            connectionStatus.value = CONNECTION_STATUS.CONNECTED;
            
            // Request current state
            connection.value.send({
              type: MESSAGE_TYPES.REQUEST_STATE,
            });
            
            resolve(id);
          });

          connection.value.on('data', (data) => {
            handleMessage(data);
          });

          connection.value.on('close', () => {
            console.log('Connection to host closed');
            connectionStatus.value = CONNECTION_STATUS.DISCONNECTED;
          });

          connection.value.on('error', (err) => {
            console.error('Connection error:', err);
            connectionStatus.value = CONNECTION_STATUS.ERROR;
            reject(err);
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
    if (connection.value) {
      connection.value.close();
      connection.value = null;
    }
    if (peer.value) {
      peer.value.destroy();
      peer.value = null;
    }
    connectionStatus.value = CONNECTION_STATUS.DISCONNECTED;
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
    connect,
    vote,
    destroy,
  };
}
