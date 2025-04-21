import React, { useState, useRef, useEffect } from 'react';
import { 
  MicrophoneIcon, 
  VideoCameraIcon, 
  PhoneIcon
} from '@heroicons/react/24/solid';
// Utilisons les icônes de base et ajoutons un style pour indiquer qu'elles sont désactivées
// puisque les icônes Off spécifiques ne sont pas disponibles dans la version actuelle
import Avatar from '../UI/Avatar';
import Button from '../UI/Button';

interface CallInterfaceProps {
  callId: string;
  callType: 'audio' | 'video';
  remoteUser: {
    id: string;
    name: string;
    avatar?: string;
  };
  isIncoming: boolean;
  onAccept?: () => void;
  onReject: () => void;
  onEnd: () => void;
  onMuteToggle: (muted: boolean) => void;
  onVideoToggle: (videoEnabled: boolean) => void;
}

const CallInterface: React.FC<CallInterfaceProps> = ({
  callId,
  callType,
  remoteUser,
  isIncoming,
  onAccept,
  onReject,
  onEnd,
  onMuteToggle,
  onVideoToggle,
}) => {
  const [callStatus, setCallStatus] = useState<'incoming' | 'connecting' | 'connected' | 'ended'>(
    isIncoming ? 'incoming' : 'connecting'
  );
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(callType === 'video');
  const [callDuration, setCallDuration] = useState(0);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Set up local video stream
  useEffect(() => {
    async function setupLocalVideo() {
      if (callType === 'video' && localVideoRef.current) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
          
          // In a real app, this stream would be sent to the peer
        } catch (error) {
          console.error('Error accessing media devices:', error);
        }
      }
    }

    if (callStatus === 'connected' && callType === 'video') {
      setupLocalVideo();
    }

    return () => {
      // Clean up media streams when component unmounts
      if (localVideoRef.current?.srcObject) {
        const stream = localVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [callStatus, callType]);

  // Start call timer when connected
  useEffect(() => {
    if (callStatus === 'connected') {
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
    }

    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, [callStatus]);

  // Format call duration as mm:ss
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Handle mute toggle
  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    onMuteToggle(!isMuted);
    
    // In a real app, this would mute the audio track
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getAudioTracks().forEach(track => {
        track.enabled = isMuted; // Toggle mute state
      });
    }
  };

  // Handle video toggle
  const handleVideoToggle = () => {
    setIsVideoEnabled(!isVideoEnabled);
    onVideoToggle(!isVideoEnabled);
    
    // In a real app, this would enable/disable the video track
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getVideoTracks().forEach(track => {
        track.enabled = !isVideoEnabled; // Toggle video state
      });
    }
  };

  // Handle accepting an incoming call
  const handleAcceptCall = () => {
    if (onAccept) {
      onAccept();
      setCallStatus('connecting');
      
      // Simulate connection delay
      setTimeout(() => {
        setCallStatus('connected');
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col items-center justify-between p-4">
      {/* Call status and duration */}
      <div className="text-center text-white mt-8">
        <h2 className="text-xl font-semibold">
          {callStatus === 'incoming' ? 'Incoming call' : 
          callStatus === 'connecting' ? 'Connecting...' : 
          callStatus === 'connected' ? formatDuration(callDuration) : 
          'Call ended'}
        </h2>
        <p className="text-gray-300 mt-2">{remoteUser.name}</p>
      </div>

      {/* Video display area */}
      <div className={`flex-1 w-full max-w-3xl flex items-center justify-center ${callType === 'video' ? '' : 'hidden'}`}>
        {callStatus === 'connected' && callType === 'video' ? (
          <div className="relative w-full h-full">
            {/* Remote video (full size) */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              muted={false}
              className="w-full h-full object-cover rounded-lg"
            />
            
            {/* Local video (picture-in-picture) */}
            {isVideoEnabled && (
              <div className="absolute bottom-4 right-4 w-1/4 max-w-[180px] aspect-video">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover rounded-lg border-2 border-white"
                />
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <Avatar name={remoteUser.name} src={remoteUser.avatar} size="xl" />
          </div>
        )}
      </div>

      {/* Avatar for audio calls */}
      {callType === 'audio' && (
        <div className="flex-1 flex items-center justify-center">
          <Avatar name={remoteUser.name} src={remoteUser.avatar} size="xl" />
        </div>
      )}

      {/* Call controls */}
      <div className="mb-8 mt-4">
        {callStatus === 'incoming' ? (
          <div className="flex space-x-8">
            <button
              onClick={onReject}
              className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center text-white shadow-lg hover:bg-red-700 transition-colors"
            >
              <PhoneIcon className="w-8 h-8 transform rotate-135" />
            </button>
            <button
              onClick={handleAcceptCall}
              className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center text-white shadow-lg hover:bg-green-700 transition-colors"
            >
              <PhoneIcon className="w-8 h-8" />
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <button
              onClick={handleMuteToggle}
              className={`p-4 rounded-full ${isMuted ? 'bg-red-500' : 'bg-gray-700'} flex items-center justify-center text-white shadow-lg`}
            >
              <MicrophoneIcon className={`w-6 h-6 ${isMuted ? 'opacity-50' : ''}`} />
            </button>
            
            <button
              onClick={onEnd}
              className="p-4 w-16 h-16 rounded-full bg-red-600 flex items-center justify-center text-white shadow-lg hover:bg-red-700 transition-colors"
            >
              <PhoneIcon className="w-8 h-8 transform rotate-135" />
            </button>
            
            {callType === 'video' && (
              <button
                onClick={handleVideoToggle}
                className={`p-4 rounded-full ${!isVideoEnabled ? 'bg-red-500' : 'bg-gray-700'} flex items-center justify-center text-white shadow-lg`}
              >
                <VideoCameraIcon className={`w-6 h-6 ${!isVideoEnabled ? 'opacity-50' : ''}`} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CallInterface;
