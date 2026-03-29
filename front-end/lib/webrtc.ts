export class WebRTCManager {
  public peerConnection: RTCPeerConnection | null = null;
  public localStream: MediaStream | null = null;
  public remoteStream: MediaStream | null = null;
  
  private socket: any; // Instance Socket.io
  private targetUserId: string;

  constructor(socket: any, targetUserId: string) {
    this.socket = socket;
    this.targetUserId = targetUserId;
  }

  async initialize() {
    // 1. Récupérer les serveurs relais ultra-sécurisés (TURN)
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    const res = await fetch(`${API_URL}/webrtc/ice-servers`);
    const iceServers = await res.json();

    // 2. Créer la connexion
    this.peerConnection = new RTCPeerConnection({ iceServers });

    // 3. Préparer l'affichage de la vidéo distante (de l'autre personne)
    this.remoteStream = new MediaStream();
    this.peerConnection.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        this.remoteStream?.addTrack(track);
      });
    };

    // 4. Écouter les candidats réseau et les envoyer via WebSocket
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit('webrtc-ice-candidate', {
          targetUserId: this.targetUserId,
          candidate: event.candidate,
        });
      }
    };
  }

  // Allume la caméra locale et l'ajoute à la connexion
  async startLocalMedia(videoElement: HTMLVideoElement) {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      videoElement.srcObject = this.localStream;
      
      this.localStream.getTracks().forEach((track) => {
        this.peerConnection?.addTrack(track, this.localStream!);
      });
    } catch (err) {
      console.error("Accès caméra refusé", err);
      throw err;
    }
  }

  async createOffer() {
    if (!this.peerConnection) return;
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    
    this.socket.emit('webrtc-offer', {
      targetUserId: this.targetUserId,
      offer,
    });
  }

  async handleOffer(offer: RTCSessionDescriptionInit) {
    if (!this.peerConnection) return;
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    
    this.socket.emit('webrtc-answer', {
      targetUserId: this.targetUserId,
      answer,
    });
  }

  async handleAnswer(answer: RTCSessionDescriptionInit) {
    await this.peerConnection?.setRemoteDescription(new RTCSessionDescription(answer));
  }

  async handleIceCandidate(candidate: RTCIceCandidateInit) {
    await this.peerConnection?.addIceCandidate(new RTCIceCandidate(candidate));
  }

  hangUp() {
    this.localStream?.getTracks().forEach(track => track.stop());
    this.peerConnection?.close();
    this.peerConnection = null;
  }
}
