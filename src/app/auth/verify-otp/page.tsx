"use client";

import React, { Suspense, useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AuthCarousel from "@/components/auth/AuthCarousel";
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
  const { i18n } = useTranslation();
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
    if (otpString.length === 4 && !isLoading) {
      handleVerifyOTP();
    }
  }, [otp]);

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

    setError(null);
    setIsLoading(true);

    try {
      const response = await verifyOTP(email, otpString);
      
      // Check if user is new or needs onboarding
      if (response.isNewUser || !response.user.isInboxCreated) {
        router.push("/auth/register?step=onboarding");
      } else {
        router.push("/inbox");
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Invalid or expired OTP. Please try again.";
      setError(errorMessage);
      // Clear OTP on error
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
                Enter verification code
              </h1>
              <p className="text-[#6F7680] text-[16px] max-w-[300px] mx-auto mt-2">
                We've sent a 4-digit code to{" "}
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
              {isLoading ? "Verifying..." : "Verify"}
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
                Didn't receive the code?{" "}
                {resendCountdown > 0 ? (
                  <span className="text-[#A2AAB4]">
                    Resend in {resendCountdown}s
                  </span>
                ) : (
                  <button
                    onClick={handleResendOTP}
                    disabled={isResending}
                    className="text-[#C46A54] underline font-medium hover:text-[#b25949] disabled:opacity-50"
                  >
                    {isResending ? "Sending..." : "Resend"}
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
                ← Back to login
              </button>
            </div>

            {/* Footer */}
            <div className="text-center mt-10 space-y-5">
              {/* Language */}
              <div className="flex justify-center items-center gap-2 pt-2">
                <span className="text-[#6F7680]">Language</span>

                <div className="relative">
                  <select
                    value={i18n.language}
                    onChange={(e) => i18n.changeLanguage(e.target.value)}
                    className="bg-transparent cursor-pointer pr-6"
                  >
                    <option value="en">English (US)</option>
                    <option value="fr">Français</option>
                    <option value="es">Español</option>
                  </select>

                  <svg
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
