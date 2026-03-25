import { useCallback, useRef } from 'react';

export function useAudioPlayer() {
  const audioContextRef = useRef<AudioContext | null>(null);

  const playBase64 = useCallback(async (base64: string) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 24000,
        });
      }

      const context = audioContextRef.current;
      if (context.state === 'suspended') {
        await context.resume();
      }

      // Decode base64 to ArrayBuffer
      const binaryString = window.atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Convert Int16 PCM to Float32
      const int16Data = new Int16Array(bytes.buffer);
      const float32Data = new Float32Array(int16Data.length);
      for (let i = 0; i < int16Data.length; i++) {
        float32Data[i] = int16Data[i] / 32768.0;
      }

      // Create AudioBuffer
      const audioBuffer = context.createBuffer(1, float32Data.length, 24000);
      audioBuffer.getChannelData(0).set(float32Data);

      // Play
      const source = context.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(context.destination);
      source.start();
    } catch (err) {
      console.error('Audio playback error:', err);
    }
  }, []);

  return { playBase64 };
}
