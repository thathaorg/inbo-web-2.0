"use client";

import {
  ArrowLeft,
  ArrowRight,
  MoreHorizontal,
  Check,
  Type,
  Timer,
} from "lucide-react";
import { useState } from "react";
import ReadModeSettings from "./ReadModeSettings";

export default function MobileFloatingNavbar({
  onMore,
  onOpenReadSettings,
}: {
  onMore: () => void;
  onOpenReadSettings: () => void;
}) {
  return (
    <div className="fixed bottom-6 inset-x-0 z-40 flex justify-center">
      <div className="flex items-center gap-3">
        <NavButton>
          <ArrowLeft size={22} />
        </NavButton>

        <div className="h-14 px-6 rounded-full flex items-center gap-6 backdrop-blur-xl bg-white/80 shadow-lg">
          <PillButton onClick={onOpenReadSettings}>
            <Type size={22} />
          </PillButton>

          <PillButton>
            <Timer size={22} />
          </PillButton>

          <PillButton>
            <Check size={22} />
          </PillButton>

          <PillButton onClick={onMore}>
            <MoreHorizontal size={22} />
          </PillButton>
        </div>

        <NavButton>
          <ArrowRight size={22} />
        </NavButton>
      </div>
    </div>
  );
}


/* ------------------------------------------------------------------ */
/* SUB COMPONENTS */
/* ------------------------------------------------------------------ */

function NavButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="
        h-11 w-11
        rounded-full
        bg-white/90
        backdrop-blur-xl
        shadow-[0_12px_32px_rgba(0,0,0,0.25)]
        flex items-center justify-center

        transition
        hover:bg-white
        active:scale-95
      "
    >
      {children}
    </button>
  );
}

function PillButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="
        h-10 w-10
        rounded-full
        flex items-center justify-center

        transition
        hover:bg-black/5
        active:bg-black/10
        active:scale-95
      "
    >
      {children}
    </button>
  );
}
