"use client";

import { useTranslation } from "react-i18next";
import { Mail, CircleQuestionMark } from "lucide-react";
import Image from "next/image";

export function IntroStep({ onEmail }: { onEmail: () => void }) {
  const { t } = useTranslation("auth");
  
  return (
    <div className="relative max-h-screen overflow-hidden bg-[#C86E58] text-white">

      {/* Help icon (same position as header) */}
      <div className="absolute top-0 right-0 z-20 h-[72px] px-6 flex items-center">
        <span className="flex h-8 w-8 items-center justify-center text-white/70">
          <CircleQuestionMark className="h-6 w-6" />
        </span>
      </div>

      {/* Background newsletter columns */}
      <div className="absolute inset-0 flex justify-center gap-6 px-8 pt-24 opacity-35">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-[260px] w-[110px] rounded-3xl bg-white/30"
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-end px-6 pb-20">

        {/* Logo */}
        <Image
          src="/logos/intro-logo.png"
          width={72}
          height={28}
          alt="inbo"
          priority
          className="mb-10"
          style={{ width: "auto", height: "auto" }}
        />

        {/* Headline */}
        <h1 className="text-center text-[28px] font-semibold leading-[1.15]">
          {t("onboarding.welcome")}
        </h1>

        <p className="mt-2 text-center text-[28px] font-semibold leading-[1.15] text-yellow-300">
          {t("onboarding.letsGetStarted")}
        </p>

        {/* Buttons */}
        <div className="mt-8 w-full max-w-sm space-y-4">
          <button
            onClick={onEmail}
            className="flex h-14 w-full items-center justify-center gap-3 rounded-full bg-white text-[15px] font-semibold text-black active:scale-[0.97]"
          >
            <Mail className="h-5 w-5" />
            {t("login.continueWithEmail") || "Continue with Email"}
          </button>

          <button className="flex h-14 w-full items-center justify-center gap-3 rounded-full border border-white/40 text-[15px] font-semibold text-white active:scale-[0.97]">
            <Image
              src="/icons/google-icon.png"
              width={18}
              height={18}
              alt="Google"
            />
            {t("login.continueWithGoogle")}
          </button>

          {/* Legal */}
          <p className="mx-auto max-w-[280px] pt-3 text-center text-[11px] leading-relaxed text-white/70">
            {t("register.agreeToTerms")} <br />
            <span className="underline">{t("register.termsOfService")}</span> {t("register.and")}{" "}
            <span className="underline">{t("register.privacyPolicy")}</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
