import { useEffect, useRef } from "react";

export default function BackgroundMusic() {
  const audioRef = useRef();

  useEffect(() => {
    const handleUserInteraction = () => {
      if (audioRef.current) {
        audioRef.current.muted = false;
        audioRef.current.volume = 0.5; // 🎧 Set volume to 20%
        audioRef.current.play().catch(() => {});
      }

      // Remove the event listener after first interaction
      window.removeEventListener("click", handleUserInteraction);
    };

    window.addEventListener("click", handleUserInteraction);

    return () => {
      window.removeEventListener("click", handleUserInteraction);
    };
  }, []);

  return (
    <audio ref={audioRef} muted autoPlay loop>
      <source src="/bgm/dorian-theme.mp3" type="audio/mpeg" />
      Your browser does not support the audio element.
    </audio>
  );
}
