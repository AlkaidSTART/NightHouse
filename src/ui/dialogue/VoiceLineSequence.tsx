import { useEffect, useRef } from 'react';

export interface VoiceLineSequenceProps {
  urls: readonly string[];
  volume: number;
}

/** Plays a short, ordered set of voice clips and releases them when the panel closes. */
export function VoiceLineSequence({
  urls,
  volume,
}: VoiceLineSequenceProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const volumeRef = useRef(volume);

  useEffect(() => {
    volumeRef.current = Math.min(1, Math.max(0, volume));
    if (audioRef.current) {
      audioRef.current.volume = volumeRef.current;
    }
  }, [volume]);

  useEffect(() => {
    let disposed = false;
    let index = 0;

    const playNext = (): void => {
      if (disposed) {
        return;
      }
      const url = urls[index++];
      if (!url) {
        return;
      }

      const audio = new Audio(url);
      audioRef.current = audio;
      audio.preload = 'auto';
      audio.volume = volumeRef.current;
      const advance = (): void => {
        audio.removeEventListener('ended', advance);
        audio.removeEventListener('error', advance);
        if (audioRef.current === audio) {
          audioRef.current = null;
        }
        audio.removeAttribute('src');
        audio.load();
        playNext();
      };
      audio.addEventListener('ended', advance, { once: true });
      audio.addEventListener('error', advance, { once: true });
      void audio.play().catch(advance);
    };

    playNext();
    return () => {
      disposed = true;
      const audio = audioRef.current;
      audioRef.current = null;
      if (audio) {
        audio.pause();
        audio.removeAttribute('src');
        audio.load();
      }
    };
  }, [urls]);

  return null;
}
