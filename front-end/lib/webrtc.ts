/**
 * WebRTC Configuration for Escorte Fatal
 * Provides standard STUN/TURN server configuration for reliable Peer-to-Peer streaming.
 */
export const rtcConfig: RTCConfiguration = {
  iceServers: [
    // Free Google STUN servers for NAT traversal
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    
    // Placeholder for a dedicated TURN server (Required for restricted corporate networks)
    // {
    //   urls: 'turn:your-turn-server.com:3478',
    //   username: 'user',
    //   credential: 'password'
    // }
  ],
  iceCandidatePoolSize: 10,
};

/**
 * Interface for WebRTC signaling messages
 */
export interface WebRTCSignal {
  senderId: string;
  data: {
    type: 'offer' | 'answer' | 'candidate';
    sdp?: string;
    candidate?: RTCIceCandidateInit;
  };
}

/**
 * Standard media constraints for high-quality live video
 */
export const mediaConstraints: MediaStreamConstraints = {
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { ideal: 30 },
    facingMode: 'user',
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
};
