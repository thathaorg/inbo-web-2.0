"use client";

import React, { useEffect, useState, useRef } from "react";
import Modal, { Styles } from "react-modal";
import { X, Play, Pause, Mic2, FastForward, Rewind } from "lucide-react";
import { useTTS } from "@/hooks/useTTS";

// Bind modal to appElement for accessibility
if (typeof window !== "undefined") {
  Modal.setAppElement("body");
}

/**
 * iOS-style bottom floating player (non-blocking)
 */
const customStyles: Styles = {
  content: {
    position: "fixed",
    bottom: "16px",
    left: "50%",
    transform: "translateX(-50%)",
    top: "auto",
    right: "auto",

    width: "min(560px, 94vw)",
    padding: 0,
    border: "none",
    borderRadius: "28px",
    backgroundColor: "transparent",
    boxShadow:
      "0 14px 32px rgba(0, 0, 0, 0.28), 0 2px 6px rgba(0, 0, 0, 0.18)",
    overflow: "visible",
  },
  overlay: {
    backgroundColor: "transparent",
    zIndex: 9999,
    pointerEvents: "none",
  },
};

interface TTSPlayerModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  title: string;
  content: string;
}

export default function TTSPlayerModal({
  isOpen,
  onRequestClose,
  title,
  content,
}: TTSPlayerModalProps) {
  const {
    speak,
    pause,
    resume,
    stop,
    isPlaying,
    isPaused,
    rate,
    setRate,
    voice,
    voices,
    setVoice,
    isSupported,
  } = useTTS();

  const [hasStarted, setHasStarted] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const voiceRef = useRef<HTMLDivElement | null>(null);

  // Auto-start when opened
  useEffect(() => {
    if (isOpen && content && !isPlaying && !isPaused && !hasStarted) {
      speak(content);
      setHasStarted(true);
    }
  }, [isOpen, content, isPlaying, isPaused, hasStarted, speak]);

  // Stop when closed
  useEffect(() => {
    if (!isOpen) {
      stop();
      setHasStarted(false);
    }
  }, [isOpen, stop]);

  // Close voice picker on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        voiceRef.current &&
        !voiceRef.current.contains(e.target as Node)
      ) {
        setVoiceOpen(false);
      }
    };

    if (voiceOpen) {
      window.addEventListener("mousedown", handleClick);
    }

    return () => {
      window.removeEventListener("mousedown", handleClick);
    };
  }, [voiceOpen]);

  if (!isSupported) return null;

  const togglePlay = () => {
    if (isPlaying) pause();
    else if (isPaused) resume();
    else speak(content);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={customStyles}
      contentLabel="Text to Speech Player"
      shouldCloseOnOverlayClick={false}
    >
      {/* Dock */}
      <div
        className="
          pointer-events-auto
          bg-white/90 backdrop-blur-2xl
          border border-gray-200/60
          rounded-[28px]
          shadow-[0_10px_30px_rgba(0,0,0,0.18)]
          px-4 py-3
          flex flex-col gap-3
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#C46A54]/15 flex items-center justify-center">
              <Mic2 size={14} className="text-[#C46A54]" />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">
                {title}
              </p>
              <p className="text-[11px] text-gray-500">Listening</p>
            </div>
          </div>

          <button
            onClick={onRequestClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-4">
          {/* Playback */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setRate(Math.max(0.5, rate - 0.25))}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <Rewind size={18} />
            </button>

            <button
              onClick={togglePlay}
              className="w-11 h-11 bg-[#C46A54] text-white rounded-full flex items-center justify-center shadow-md active:scale-95 transition"
            >
              {isPlaying ? (
                <Pause size={18} fill="currentColor" />
              ) : (
                <Play size={18} fill="currentColor" className="ml-0.5" />
              )}
            </button>

            <button
              onClick={() => setRate(Math.min(2, rate + 0.25))}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <FastForward size={18} />
            </button>
          </div>

          {/* Settings */}
          <div className="relative flex items-center gap-2" ref={voiceRef}>
            <span className="text-[11px] bg-gray-100 px-2 py-2 rounded-xl">
              {rate}×
            </span>

            {/* Voice button */}
            <button
              onClick={() => setVoiceOpen((v) => !v)}
              className="
                bg-gray-100
                text-xs
                px-3 py-2
                rounded-lg
                max-w-[260px]
                truncate
                hover:bg-gray-200
                transition
              "
            >
              {voice?.name || "Select voice"}
            </button>

            {/* Voice list */}
            {voiceOpen && (
              <div
                className="
                  absolute
                  bottom-full
                  right-0
                  mb-2
                  w-[260px]
                  max-h-[220px]
                  overflow-y-auto
                  bg-white
                  rounded-xl
                  border border-gray-200
                  shadow-[0_10px_30px_rgba(0,0,0,0.25)]
                  z-50
                "
              >
                {voices.map((v) => (
                  <button
                    key={v.name}
                    onClick={() => {
                      setVoice(v);
                      setVoiceOpen(false);
                    }}
                    className={`
                      w-full text-left px-3 py-2 text-xs
                      hover:bg-gray-100 transition
                      ${
                        voice?.name === v.name
                          ? "bg-gray-100 font-medium"
                          : ""
                      }
                    `}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
