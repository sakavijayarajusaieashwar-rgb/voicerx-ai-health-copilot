// src/hooks/useAudioPlayer.ts
import { useCallback, useRef } from 'react';

export function useAudioPlayer() {
  const audioContextRef = useRef<AudioContext | null>(null);

  const playBase64 = useCallback(async (base64: string) => {
    try {
      if (!base64) throw new Error("No base64 string provided");

      // 1. SANITIZE: Remove Data URI prefix if it exists
      // e.g., "data:audio/mpeg;base64,SUQz..." -> "SUQz..."
      const cleanBase64 = base64.includes(',') ? base64.split(',')[1] : base64;

      // Initialize AudioContext
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const context = audioContextRef.current;
      if (context.state === 'suspended') {
        await context.resume();
      }

      // 2. DECODE: Base64 string to ArrayBuffer
      const binaryString = window.atob(cleanBase64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // 3. PROCESS: Web Audio API decodes the binary MP3/WAV
      // We use slice() to ensure we have a clean ArrayBuffer view
      const audioBuffer = await context.decodeAudioData(bytes.buffer.slice(0));

      // 4. PLAY
      const source = context.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(context.destination);
      source.start();

    } catch (err) {
      // If it reaches here, 'bytes.buffer' was not a valid audio format
      console.error('Audio playback error:', err);
    }
  }, []);

  return { playBase64 };
}