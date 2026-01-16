"use client";

import { useState, useRef, useEffect } from "react";
import { Sun, Moon, Laptop, ChevronRight } from "lucide-react";

/* ------------------------------------------------------------------ */
/* TYPES */
/* ------------------------------------------------------------------ */
type ThemeMode = "light" | "dark" | "system";
type PageColor = "white" | "paper" | "calm";
type FontFamily = "sans" | "serif" | "mono";
type FontType =
  | "Default"
  | "Helvetica Neue"
  | "Avenir"
  | "Times New Roman"
  | "Georgia";

interface ReadModeSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  // Optional external state props for controlled mode
  themeMode?: ThemeMode;
  setThemeMode?: (v: ThemeMode) => void;
  fontSize?: number;
  setFontSize?: (v: number) => void;
  pageColor?: PageColor;
  setPageColor?: (v: PageColor) => void;
  fontFamily?: FontFamily;
  setFontFamily?: (v: FontFamily) => void;
}

/* ------------------------------------------------------------------ */
/* COMPONENT */
/* ------------------------------------------------------------------ */
export default function ReadModeSettings({
  isOpen,
  onClose,
  themeMode: externalTheme,
  setThemeMode: externalSetTheme,
  fontSize: externalFontSize,
  setFontSize: externalSetFontSize,
  pageColor: externalPageColor,
  setPageColor: externalSetPageColor,
  fontFamily: externalFontFamily,
  setFontFamily: externalSetFontFamily,
}: ReadModeSettingsProps) {
  // Internal state (used when no external state is provided)
  const [internalTheme, setInternalTheme] = useState<ThemeMode>("system");
  const [internalPageColor, setInternalPageColor] = useState<PageColor>("white");
  const [internalFontSize, setInternalFontSize] = useState(17);
  const [internalFontFamily, setInternalFontFamily] = useState<FontFamily>("sans");
  const [font, setFont] = useState<FontType>("Helvetica Neue");
  const [showFonts, setShowFonts] = useState(false);

  // Use external state if provided, otherwise use internal state
  const theme = externalTheme ?? internalTheme;
  const setTheme = externalSetTheme ?? setInternalTheme;
  const currentPageColor = externalPageColor ?? internalPageColor;
  const setCurrentPageColor = externalSetPageColor ?? setInternalPageColor;
  const fontSize = externalFontSize ?? internalFontSize;
  const setFontSize = externalSetFontSize ?? setInternalFontSize;
  const fontFamily = externalFontFamily ?? internalFontFamily;
  const setFontFamilyState = externalSetFontFamily ?? setInternalFontFamily;

  const panelRef = useRef<HTMLDivElement>(null);
  const fontRef = useRef<HTMLDivElement>(null);

  /* ---------------- BODY SCROLL LOCK ---------------- */
  useEffect(() => {
    if (!isOpen) return;

    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  /* ---------------- ESC KEY (DESKTOP) ---------------- */
  useEffect(() => {
    if (!isOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowFonts(false);
        onClose();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  /* ---------------- CLICK OUTSIDE (DESKTOP ONLY) ---------------- */
  useEffect(() => {
    if (!isOpen) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;

      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        (!fontRef.current || !fontRef.current.contains(target))
      ) {
        setShowFonts(false);
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* ================= BACKDROP (DESKTOP ONLY) ================= */}
      <div
        className="hidden md:block absolute inset-0"
        onClick={() => {
          setShowFonts(false);
          onClose();
        }}
      />

      {/* ================= SETTINGS PANEL ================= */}
      <div
        className="
          fixed inset-x-0 bottom-0
          md:inset-auto md:left-[88px] md:top-1/2 md:-translate-y-1/2
        "
        onClick={(e) => e.stopPropagation()}
      >
        <div
          ref={panelRef}
          className="
            w-full md:w-[360px]
            bg-white
            rounded-t-2xl md:rounded-xl
            border border-gray-200
            shadow-[0_9px_21px_rgba(133,133,133,0.10)]
            p-6
            flex flex-col gap-4
          "
        >
          {/* MOBILE HANDLE */}
          <div className="md:hidden flex justify-center mb-2">
            <div className="w-10 h-1.5 rounded-full bg-gray-300" />
          </div>

          <h3 className="text-sm font-medium text-[#0C1014]">
            Inbo Appearance
          </h3>

          {/* THEME */}
          <div className="flex gap-2">
            <ThemeButton
              label="Light"
              icon={<Sun size={14} />}
              active={theme === "light"}
              onClick={() => setTheme("light")}
            />
            <ThemeButton
              label="Dark"
              icon={<Moon size={14} />}
              active={theme === "dark"}
              onClick={() => setTheme("dark")}
            />
            <ThemeButton
              label="System"
              icon={<Laptop size={14} />}
              active={theme === "system"}
              onClick={() => setTheme("system")}
            />
          </div>

          {/* SIZE */}
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-[#0C1014]">Size</p>
            <div className="flex gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFontSize(Math.max(14, fontSize - 2));
                }}
                disabled={fontSize <= 14}
                className={`flex-1 h-11 rounded-xl border flex items-center justify-center font-medium transition ${fontSize <= 14 ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'bg-white hover:bg-gray-50'}`}
              >
                A -
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFontSize(Math.min(32, fontSize + 2));
                }}
                disabled={fontSize >= 32}
                className={`flex-1 h-11 rounded-xl border flex items-center justify-center font-medium transition ${fontSize >= 32 ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'bg-white hover:bg-gray-50'}`}
              >
                A +
              </button>
            </div>
            <p className="text-xs text-center text-gray-400">{fontSize}px</p>
          </div>

          {/* PAGE COLOR */}
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-[#0C1014]">
              Page Color
            </p>
            <div className="flex gap-3">
              <PageColorCard
                label="White"
                bg="/icons/read-page-white.png"
                active={currentPageColor === "white"}
                onClick={() => setCurrentPageColor("white")}
              />
              <PageColorCard
                label="Paper"
                bg="/icons/read-page-paper.png"
                active={currentPageColor === "paper"}
                onClick={() => setCurrentPageColor("paper")}
              />
              <PageColorCard
                label="Calm"
                bg="/icons/read-page-calm.png"
                active={currentPageColor === "calm"}
                onClick={() => setCurrentPageColor("calm")}
              />
            </div>
          </div>

          {/* FONT TRIGGER */}
          <button
            onClick={() => setShowFonts(true)}
            className="
              h-11 px-4 rounded-xl
              flex items-center justify-between
              bg-[#F3F4F6]
            "
          >
            <span className="text-sm text-[#0C1014]">Font</span>
            <div className="flex items-center gap-1 text-[#6F7680]">
              <span className="text-sm">{font}</span>
              <ChevronRight size={16} />
            </div>
          </button>
        </div>
      </div>

      {/* ================= FONT PANEL ================= */}
      {showFonts && (
        <div
          className="
            fixed inset-x-0 bottom-0
            md:inset-auto md:left-[460px] md:top-3/4 md:-translate-y-1/2
          "
          onClick={(e) => e.stopPropagation()}
        >
          <div
            ref={fontRef}
            className="
              w-full md:w-[260px]
              bg-[#F3F4F6]
              rounded-t-2xl md:rounded-xl
              shadow-[0_9px_21px_rgba(133,133,133,0.10)]
              overflow-hidden
            "
          >
            <div className="md:hidden flex justify-center py-2">
              <div className="w-10 h-1.5 rounded-full bg-gray-300" />
            </div>

            {(
              [
                "Default",
                "Helvetica Neue",
                "Avenir",
                "Times New Roman",
                "Georgia",
              ] as FontType[]
            ).map((f) => (
              <button
                key={f}
                onClick={() => {
                  setFont(f);
                  setShowFonts(false);
                }}
                className={`
                  w-full px-4 py-3 text-sm text-center
                  border-b border-gray-200/60 last:border-b-0
                  ${
                    font === f
                      ? "text-[#C46A54]"
                      : "text-[#0C1014]"
                  }
                `}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* SUB COMPONENTS */
/* ------------------------------------------------------------------ */

function ThemeButton({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex-1 h-9 rounded-full
        flex items-center justify-center gap-2
        text-sm font-medium
        transition
        ${
          active
            ? "bg-black text-white"
            : "bg-[#F3F4F6] text-[#0C1014]"
        }
      `}
    >
      {icon}
      {label}
    </button>
  );
}

function SizeButton({ label }: { label: string }) {
  return (
    <button
      className="
        flex-1 h-11 rounded-xl
        bg-[#F3F4F6]
        border border-[#DBDFE4]
        text-base font-medium
        hover:bg-gray-200
      "
    >
      {label}
    </button>
  );
}

function PageColorCard({
  label,
  bg,
  active,
  onClick,
}: {
  label: string;
  bg: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex-1 flex flex-col items-center gap-2"
    >
      <div
        className={`
          rounded-xl border
          ${active ? "border-black border-2" : "border-gray-300"}
        `}
      >
        <img src={bg} alt={label} />
      </div>
      <span className="text-sm text-[#0C1014]">{label}</span>
    </button>
  );
}
