import { useState, useEffect, useRef, useCallback } from 'react';

export type TTSState = {
  isPlaying: boolean;
  isPaused: boolean;
  text: string;
  volume: number;
  rate: number;
  pitch: number;
  voice: SpeechSynthesisVoice | null;
  voices: SpeechSynthesisVoice[];
  isSupported: boolean;
};

export const useTTS = () => {
  const [state, setState] = useState<TTSState>({
    isPlaying: false,
    isPaused: false,
    text: '',
    volume: 1,
    rate: 1,
    pitch: 1,
    voice: null,
    voices: [],
    isSupported: false,
  });

  const synth = useRef<SpeechSynthesis | null>(null);
  const utterance = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synth.current = window.speechSynthesis;
      setState((prev) => ({ ...prev, isSupported: true }));

      const updateVoices = () => {
        if (!synth.current) return;
        const voices = synth.current.getVoices();
        setState((prev) => ({
          ...prev,
          voices,
          // Default to first voice if none selected
          voice: prev.voice || voices[0] || null,
        }));
      };

      updateVoices();

      // Chrome loads voices asynchronously
      if (synth.current.onvoiceschanged !== undefined) {
        synth.current.onvoiceschanged = updateVoices;
      }
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (!synth.current) return;

    // Cancel any current speaking
    synth.current.cancel();

    const newUtterance = new SpeechSynthesisUtterance(text);
    newUtterance.volume = state.volume;
    newUtterance.rate = state.rate;
    newUtterance.pitch = state.pitch;
    if (state.voice) {
      newUtterance.voice = state.voice;
    }

    newUtterance.onstart = () => {
      setState((prev) => ({ ...prev, isPlaying: true, isPaused: false }));
    };

    newUtterance.onend = () => {
      setState((prev) => ({ ...prev, isPlaying: false, isPaused: false }));
    };

    newUtterance.onerror = (event) => {
      // Only log if it's a real error, not just an interruption
      if (event.error !== 'interrupted') {
        console.error('TTS Error:', event.error, event);
      }
      setState((prev) => ({ ...prev, isPlaying: false, isPaused: false }));
    };

    utterance.current = newUtterance;
    synth.current.speak(newUtterance);
    setState((prev) => ({ ...prev, text }));
  }, [state.volume, state.rate, state.pitch, state.voice]);

  const pause = useCallback(() => {
    if (!synth.current) return;
    synth.current.pause();
    setState((prev) => ({ ...prev, isPaused: true, isPlaying: false }));
  }, []);

  const resume = useCallback(() => {
    if (!synth.current) return;
    synth.current.resume();
    setState((prev) => ({ ...prev, isPaused: false, isPlaying: true }));
  }, []);

  const stop = useCallback(() => {
    if (!synth.current) return;
    synth.current.cancel();
    setState((prev) => ({ ...prev, isPlaying: false, isPaused: false }));
  }, []);

  const setVolume = (volume: number) => setState((prev) => ({ ...prev, volume }));
  const setRate = (rate: number) => setState((prev) => ({ ...prev, rate }));
  const setPitch = (pitch: number) => setState((prev) => ({ ...prev, pitch }));
  const setVoice = (voice: SpeechSynthesisVoice) => setState((prev) => ({ ...prev, voice }));

  return {
    ...state,
    speak,
    pause,
    resume,
    stop,
    setVolume,
    setRate,
    setPitch,
    setVoice,
  };
};
