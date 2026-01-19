"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AuthCarousel from "@/components/auth/AuthCarousel";
import { SEOHead } from "@/components/seo/SEOHead";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import LanguageSelector from "@/components/LanguageSelector";

export default function LoginPage() {
  const { t } = useTranslation("auth");
  const router = useRouter();
  const { isAuthenticated, sendOTP, googleAuth } = useAuth();

  const isMobile = useMediaQuery("(max-width: 768px)");

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValidEmail, setIsValidEmail] = useState(false);

  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  useEffect(() => {
    setIsValidEmail(validateEmail(email));
  }, [email]);

  /* ================= AUTH REDIRECT ================= */

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/inbox");
    }
  }, [isAuthenticated, router]);

  /* ================= MOBILE REDIRECT ================= */

  useEffect(() => {
    if (isMobile) {
      router.replace("/auth/register");
    }
  }, [isMobile, router]);

  /* ================= SEND OTP HANDLER ================= */

  const handleSendOTP = async () => {
    if (!isValidEmail) {
      setError(t("login.invalidEmail"));
      return;
    }

    setError(null);
    setIsLoading(true);
    
    try {
      await sendOTP(email);
      // Navigate to OTP verification page with email
      router.push(`/auth/verify-otp?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      const errorMessage = 
        err?.response?.data?.message || 
        err?.message || 
        t("login.otpFailed");
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /* ================= HANDLE KEY PRESS ================= */

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && isValidEmail && !isLoading) {
      handleSendOTP();
    }
  };

  if (isMobile) return null;

  return (
    <>
      <SEOHead title={t("login.title")} description="Login to Inbo" />

      <div className="flex h-screen bg-white">
        {/* LEFT */}
        <div className="hidden lg:flex w-1/2 h-full">
          <AuthCarousel />
        </div>

        {/* RIGHT */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-10 bg-white">
          <div className="w-full max-w-sm">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <Image
                src="/logos/inbo-logo.png"
                alt="Inbo Logo"
                width={110}
                height={45}
              />
            </div>

            {/* Heading */}
            <div className="text-center mb-8">
              <h1 className="text-[32px] font-bold text-[#0C1014]">
                {t("login.welcomeBack")}
              </h1>
              <p className="text-[#6F7680] text-[16px] max-w-[260px] mx-auto mt-2">
                {t("login.subtitle")}
              </p>
            </div>

            {/* Google Login */}
            <button
              onClick={async () => {
                await googleAuth({} as any);
              }}
              className="w-full flex items-center justify-center gap-3 bg-[#F3F4F6] py-3.5 rounded-full hover:bg-gray-200 transition"
            >
              <Image
                src="/icons/google-icon.png"
                width={18}
                height={18}
                alt="Google"
              />
              <span className="text-[#272727] font-medium">
                {t("login.continueWithGoogle")}
              </span>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-[#E3E5E8]" />
              <span className="text-[#A2AAB4] text-sm font-medium">{t("login.or")}</span>
              <div className="flex-1 h-px bg-[#E3E5E8]" />
            </div>

            {/* Email Input */}
            <div className="mb-6">
              <label className="text-sm text-[#6F7680]">{t("login.emailLabel")}</label>
              <input
                type="email"
                placeholder={t("login.emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                className="
                  w-full py-3 px-4 mt-2 rounded-full border border-[#DBDFE4]
                  text-gray-700 placeholder-[#A2AAB4]
                  focus:ring-2 focus:ring-[#C46A54] focus:outline-none
                "
              />
            </div>

            {/* Send OTP Button */}
            <button
              onClick={handleSendOTP}
              disabled={isLoading || !isValidEmail}
              className="
                w-full bg-[#C46A54] text-white py-3.5 rounded-full font-medium
                hover:bg-[#b25949] transition disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {isLoading ? t("login.sending") : t("login.sendCode")}
            </button>

            {/* Error */}
            {error && (
              <p className="text-red-500 bg-red-50 px-4 py-2 rounded text-sm text-center mt-3">
                {error}
              </p>
            )}

            {/* Footer */}
            <div className="text-center mt-10 space-y-5">
              <p className="text-[#6F7680]">
                {t("login.noAccount")}{" "}
                <a
                  href="/auth/register"
                  className="text-[#C46A54] underline font-medium"
                >
                  {t("login.signUp")}
                </a>
              </p>

              {/* Language Selector */}
              <div className="flex justify-center pt-2">
                <LanguageSelector variant="default" labelPosition="inline" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
