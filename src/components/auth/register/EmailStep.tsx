"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const listener = () => setMatches(media.matches);

    listener();
    media.addEventListener("change", listener);

    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

export default function EmailStep({
  formData,
  setFormData,
  googleLogin,
  isLoading,
  onContinue,
  devMode = false,
}: any) {
  const isMobile = useMediaQuery("(max-width: 640px)");
  const { t } = useTranslation("auth");
  const isEmailValid =
  !!formData.email &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  /* =========================
     MOBILE SECTION
     ========================= */
  if (isMobile) {
    const showError = !!formData.email && !isEmailValid;

    return (
      <div className="max-h-screen flex flex-col bg-white">
        {/* CONTENT */}
        <div className="flex-1 px-4 pt-6 pb-36">
          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-[24px] font-bold text-[#0C1014]">
              {t("onboarding.letsGetStarted")}
            </h1>
            <p className="text-[#6F7680] text-[14px] mt-2">
              {t("login.subtitle")}
            </p>
          </div>

          {/* Email Input */}
          <input
            type="email"
            value={formData.email}
            placeholder="name@example.com"
            onChange={(e) =>
              setFormData((p: any) => ({ ...p, email: e.target.value }))
            }
            className={`
              w-full py-4 px-4 rounded-2xl text-[16px] outline-none
              placeholder-[#A2AAB4]
              ${
                showError
                  ? "border-2 border-red-500 bg-red-50"
                  : "border border-[#DBDFE4] focus:ring-2 focus:ring-[#C46A54]"
              }
            `}
          />

          {/* Error */}
          {showError && (
            <p className="mt-2 text-[14px] text-red-500">
              {t("login.invalidEmail")}
            </p>
          )}
        </div>

        {/* STICKY CTA (follows keyboard) */}
        <div
          className="fixed left-0 right-0 bottom-0 bg-white"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="px-4 py-4">
            <button
              onClick={onContinue}
              disabled={!isEmailValid || isLoading}
              className="
                w-full py-4 rounded-2xl text-[16px] font-medium
                disabled:bg-[#F1F3F5] disabled:text-[#A2AAB4]
                bg-[#C46A54] text-white
              "
            >
              {isLoading ? t("login.sending") : t("login.sendCode")}
            </button>
          </div>
        </div>
      </div>
    );
  }


  /* =========================
     DESKTOP SECTION (UNCHANGED)
     ========================= */
  return (
    <div className="w-full border-black">

      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-[32px] font-bold text-[#0C1014] leading-[38px]">
          Create an account
        </h1>
        <p className="text-[#6F7680] text-[16px] mt-2 leading-[22px] max-w-[320px] mx-auto">
          We’ll email you a magic link so we can verify your email address.
        </p>
      </div>

      {/* Google Button */}
      <button
        onClick={() => googleLogin?.()}
        className="
          w-full flex items-center justify-center gap-3
          bg-[#F3F4F6]
          py-3.5 rounded-full
          text-[15px] font-medium text-[#272727]
          hover:bg-[#ECECEC]
          transition
        "
      >
        <Image src="/icons/google-icon.png" width={18} height={18} alt="Google" />
        Continue with Google
      </button>

      {/* Divider */}
      <div className="flex items-center gap-4 my-8">
        <div className="flex-1 h-px bg-[#E3E5E8]" />
        <span className="text-[#A2AAB4] text-[14px] font-medium">OR</span>
        <div className="flex-1 h-px bg-[#E3E5E8]" />
      </div>

      {/* Email Label */}
      <label className="text-sm text-[#6F7680] block mb-2">
        Email address
      </label>

      {/* Email Input */}
      <input
        type="email"
        value={formData.email}
        placeholder="you@example.com"
        onChange={(e) =>
          setFormData((p: any) => ({ ...p, email: e.target.value }))
        }
        className="
          w-full py-3.5 px-4 
          rounded-full
          border border-[#DBDFE4]
          text-[15px]
          placeholder-[#A2AAB4]
          focus:ring-2 focus:ring-[#C46A54]
          outline-none
          transition
        "
      />

      {/* Continue Button */}
      <button
        onClick={onContinue}
        disabled={isLoading}
        className="
          w-full mt-5 
          bg-[#C46A54] text-white 
          py-3.5 rounded-full text-[16px] font-medium
          hover:bg-[#b55c46]
          transition
          disabled:opacity-50
        "
      >
        {isLoading ? t("login.sending") : t("login.sendCode")}
      </button>

      {/* Simulate Button */}
      {devMode && (
        <button
          onClick={onContinue}
          className="
            w-full mt-3 bg-[#616161] text-white py-2 
            rounded-full text-sm opacity-70
          "
        >
          Simulate → Next Step
        </button>
      )}

      {/* Already have account + Terms */}
      <div className="mt-6 text-center space-y-3">
        <p className="text-[#6F7680]">
          {t("register.alreadyHaveAccount")}{" "}
          <Link href="/auth/login" className="text-[#C46A54] underline font-medium">
            {t("register.signIn")}
          </Link>
        </p>

        <p className="text-[#6F7680] text-[14px] leading-[16px] mx-4">
          {t("register.agreeToTerms")}
          <br />
          <Link href="/terms" className="text-[#C46A54] font-normal underline">
            {t("register.termsOfService")}
          </Link>
          <span className="text-[#6F7680]">{" "}{t("register.and")}{" "}</span>
          <Link href="/privacy" className="text-[#C46A54] font-normal underline">
            {t("register.privacyPolicy")}
          </Link>
        </p>
      </div>
    </div>
  );
}
