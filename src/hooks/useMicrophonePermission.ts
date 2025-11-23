import { useCallback, useEffect, useState } from 'react';

export type MicrophonePermissionState = 'granted' | 'denied' | 'prompt' | 'checking';

export const useMicrophonePermission = () => {
  const [permissionState, setPermissionState] = useState<MicrophonePermissionState>('checking');
  const [microphoneAvailable, setMicrophoneAvailable] = useState(false);

  const checkPermission = useCallback(async () => {
    try {
      setPermissionState('checking');

      // Check if MediaDevices API is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('MediaDevices API not supported');
        setPermissionState('denied');
        setMicrophoneAvailable(false);
        return 'denied';
      }

      // Check permission status
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          setPermissionState(permissionStatus.state as MicrophonePermissionState);
          setMicrophoneAvailable(permissionStatus.state === 'granted');

          // Listen for permission changes
          permissionStatus.onchange = () => {
            setPermissionState(permissionStatus.state as MicrophonePermissionState);
            setMicrophoneAvailable(permissionStatus.state === 'granted');
          };

          return permissionStatus.state;
        } catch (error) {
          console.log('Permission query not supported, will try to request access');
        }
      }

      // If permission query is not supported, try to get user media directly
      setPermissionState('prompt');
      return 'prompt';
    } catch (error) {
      console.error('Error checking microphone permission:', error);
      setPermissionState('denied');
      setMicrophoneAvailable(false);
      return 'denied';
    }
  }, []);

  const requestPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Permission granted, stop the stream immediately
      stream.getTracks().forEach(track => track.stop());

      setPermissionState('granted');
      setMicrophoneAvailable(true);
      return true;
    } catch (error) {
      console.error('Error requesting microphone permission:', error);
      setPermissionState('denied');
      setMicrophoneAvailable(false);
      return false;
    }
  }, []);

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  return {
    permissionState,
    microphoneAvailable,
    checkPermission,
    requestPermission,
  };
};
