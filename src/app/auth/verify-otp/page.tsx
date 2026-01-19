"use client";

import React, { Suspense, useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AuthCarousel from "@/components/auth/AuthCarousel";
import LanguageSelector from "@/components/LanguageSelector";
import { SEOHead } from "@/components/seo/SEOHead";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center w-full h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black" />
      </div>
    }>
      <VerifyOTPContent />
    </Suspense>
  );
}

function VerifyOTPContent() {
  const { t, i18n } = useTranslation("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, verifyOTP, sendOTP } = useAuth();

  const isMobile = useMediaQuery("(max-width: 768px)");

  const email = searchParams.get("email") || "";
  
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(0);

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  /* ================= REDIRECT IF NO EMAIL ================= */

  useEffect(() => {
    if (!email) {
      router.replace("/auth/login");
    }
  }, [email, router]);

  /* ================= AUTH REDIRECT ================= */

  // Disabled to prevent race condition with handleVerifyOTP redirect
  // useEffect(() => {
  //   if (isAuthenticated) {
  //     router.push("/inbox");
  //   }
  // }, [isAuthenticated, router]);

  /* ================= MOBILE REDIRECT ================= */

  useEffect(() => {
    if (isMobile) {
      router.replace("/auth/register");
    }
  }, [isMobile, router]);

  /* ================= RESEND COUNTDOWN ================= */

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  /* ================= AUTO VERIFY WHEN OTP COMPLETE ================= */

  useEffect(() => {
    const otpString = otp.join("");
    
    // Only auto-verify if:
    // 1. OTP is complete (4 digits)
    // 2. Not already loading
    // 3. Email is present
    // 4. No error (to allow retry after clearing error)
    if (otpString.length === 4 && !isLoading && email && !error) {
      // Small delay to ensure state is stable
      const timer = setTimeout(() => {
        handleVerifyOTP();
      }, 100);
      
      return () => {
        clearTimeout(timer);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp, isLoading, email, error]); // Don't include handleVerifyOTP to prevent loops

  /* ================= HANDLE OTP INPUT CHANGE ================= */

  const handleOtpChange = (index: number, value: string) => {
    // Only allow numeric input
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    
    // Handle paste
    if (value.length > 1) {
      const pastedValue = value.slice(0, 4).split("");
      pastedValue.forEach((digit, i) => {
        if (index + i < 4) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);
      
      // Focus last filled input or the next empty one
      const nextIndex = Math.min(index + pastedValue.length, 3);
      inputRefs[nextIndex]?.current?.focus();
      return;
    }

    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs[index + 1]?.current?.focus();
    }
  };

  /* ================= HANDLE KEY DOWN ================= */

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs[index - 1]?.current?.focus();
    }
    if (e.key === "Enter") {
      handleVerifyOTP();
    }
  };

  /* ================= VERIFY OTP ================= */

  const handleVerifyOTP = async () => {
    const otpString = otp.join("");
    
    if (otpString.length !== 4) {
      setError("Please enter the complete 4-digit code");
      return;
    }

    // Prevent multiple simultaneous verification attempts (only check isLoading)
    if (isLoading) {
      console.log("⏳ Verification already in progress, skipping...");
      return;
    }

    // Check email is present
    if (!email) {
      setError("Email is missing. Please go back and enter your email.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      console.log("🔐 Verifying OTP for:", email, "OTP:", otpString);
      const response = await verifyOTP(email, otpString);
      
      // Wait for auth state to fully propagate before redirecting
      // This prevents race condition where dashboard checks auth before state is ready
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Verify the token was actually saved before redirecting
      const Cookies = (await import('js-cookie')).default;
      const tokenSaved = !!Cookies.get('access_token');
      console.log("🔄 Pre-redirect check - Token saved:", tokenSaved);
      
      if (!tokenSaved) {
        console.warn("⚠️ Token not found after verification, retrying...");
        // Wait a bit more and check again
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Check if user is new or needs onboarding
      if (response.isNewUser || !response.user.isInboxCreated) {
        router.push("/auth/register?step=onboarding");
      } else {
        router.push("/inbox");
      }
    } catch (err: any) {
      console.error("❌ OTP verification failed:", err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Invalid or expired OTP. Please try again.";
      setError(errorMessage);
      // Clear OTP on error to allow retry
      setOtp(["", "", "", ""]);
      inputRefs[0]?.current?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  /* ================= RESEND OTP ================= */

  const handleResendOTP = async () => {
    if (resendCountdown > 0 || isResending) return;

    setError(null);
    setIsResending(true);

    try {
      await sendOTP(email);
      setResendCountdown(60); // 60 seconds countdown
      setOtp(["", "", "", ""]);
      inputRefs[0]?.current?.focus();
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to resend OTP. Please try again.";
      setError(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  if (isMobile || !email) return null;

  return (
    <>
      <SEOHead title="Verify OTP" description="Verify your email with OTP" />

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
                {t("otp.title")}
              </h1>
              <p className="text-[#6F7680] text-[16px] max-w-[300px] mx-auto mt-2">
                {t("otp.subtitle")}{" "}
                <span className="font-medium text-[#0C1014]">{email}</span>
              </p>
            </div>

            {/* OTP Input */}
            <div className="flex justify-center gap-3 mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={inputRefs[index]}
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="
                    w-14 h-14 text-center text-2xl font-semibold
                    rounded-xl border border-[#DBDFE4]
                    text-gray-700 placeholder-[#A2AAB4]
                    focus:ring-2 focus:ring-[#C46A54] focus:outline-none
                    transition-all
                  "
                  autoFocus={index === 0}
                />
              ))}
            </div>

            {/* Verify Button */}
            <button
              onClick={handleVerifyOTP}
              disabled={isLoading || otp.join("").length !== 4}
              className="
                w-full bg-[#C46A54] text-white py-3.5 rounded-full font-medium
                hover:bg-[#b25949] transition disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {isLoading ? t("otp.verifying") : t("otp.verify")}
            </button>

            {/* Error */}
            {error && (
              <p className="text-red-500 bg-red-50 px-4 py-2 rounded text-sm text-center mt-3">
                {error}
              </p>
            )}

            {/* Resend OTP */}
            <div className="text-center mt-6">
              <p className="text-[#6F7680]">
                {t("otp.didntReceive")}{" "}
                {resendCountdown > 0 ? (
                  <span className="text-[#A2AAB4]">
                    {t("otp.resendIn", { seconds: resendCountdown })}
                  </span>
                ) : (
                  <button
                    onClick={handleResendOTP}
                    disabled={isResending}
                    className="text-[#C46A54] underline font-medium hover:text-[#b25949] disabled:opacity-50"
                  >
                    {isResending ? t("login.sending") : t("otp.resendCode")}
                  </button>
                )}
              </p>
            </div>

            {/* Back to Login */}
            <div className="text-center mt-4">
              <button
                onClick={() => router.push("/auth/login")}
                className="text-[#6F7680] hover:text-[#0C1014] transition"
              >
                ← {t("register.alreadyHaveAccount")} {t("register.signIn")}
              </button>
            </div>

            {/* Footer */}
            <div className="text-center mt-10 space-y-5">
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
