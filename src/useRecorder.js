import { useRef, useState, useCallback, useEffect } from 'react';

/**
 * Captures audio via MediaRecorder so the user can play back what they said.
 * Lives alongside the SpeechRecognition flow — recognition handles the text,
 * this just keeps a Blob URL for playback.
 */
export function useRecorder() {
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const audioElRef = useRef(null);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }, []);

  const start = useCallback(async () => {
    // Reset previous recording
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    chunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      // Pick a mimeType the browser actually supports (iOS Safari needs mp4, not webm)
      let options;
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported) {
        if (MediaRecorder.isTypeSupported('audio/webm')) options = { mimeType: 'audio/webm' };
        else if (MediaRecorder.isTypeSupported('audio/mp4')) options = { mimeType: 'audio/mp4' };
      }
      const rec = options ? new MediaRecorder(stream, options) : new MediaRecorder(stream);
      recorderRef.current = rec;
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || 'audio/webm' });
        setAudioUrl(URL.createObjectURL(blob));
        stopStream();
      };
      rec.start();
    } catch (err) {
      console.warn('Mic access denied or unavailable:', err);
      stopStream();
    }
  }, [audioUrl, stopStream]);

  const stop = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    } else {
      stopStream();
    }
  }, [stopStream]);

  const play = useCallback(() => {
    if (!audioUrl) return;
    if (!audioElRef.current) audioElRef.current = new Audio();
    const el = audioElRef.current;
    el.src = audioUrl;
    el.onended = () => setIsPlaying(false);
    el.onpause = () => setIsPlaying(false);
    el.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  }, [audioUrl]);

  const pausePlayback = useCallback(() => {
    audioElRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const reset = useCallback(() => {
    pausePlayback();
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    chunksRef.current = [];
  }, [audioUrl, pausePlayback]);

  // Cleanup on unmount
  useEffect(() => () => {
    stopStream();
    if (recorderRef.current && recorderRef.current.state !== 'inactive') recorderRef.current.stop();
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    audioElRef.current?.pause();
  }, [audioUrl, stopStream]);

  return { audioUrl, isPlaying, start, stop, play, pausePlayback, reset };
}
