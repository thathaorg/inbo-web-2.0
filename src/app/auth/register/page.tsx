"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/seo/SEOHead";
import AuthCarousel from "@/components/auth/AuthCarousel";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useAuth } from "@/contexts/AuthContext";

// Mobile section
import MobileSignupSection from "@/app/auth/register/MobileSignupSection";

// Steps
import EmailStep from "@/components/auth/register/EmailStep";
import VerifyCodePage from "@/components/auth/register/VerifyCode";
import UsernameStep from "@/components/auth/register/UsernameStep";
import CategoriesStep from "@/components/auth/register/CategoriesStep";
import ReminderStep from "@/components/auth/register/ReminderStep";
import WhereStep from "@/components/auth/register/WhereHeardStep";

export type Step =
  | "intro"
  | "email"
  | "check-email"
  | "username"
  | "categories"
  | "reminder"
  | "where"
  | "notify";

export default function SignupPage() {
  const router = useRouter();
  const { i18n } = useTranslation();
  const { sendOTP, verifyOTP } = useAuth();

  const isMobile = useMediaQuery("(max-width: 768px)");
  const DEV_MODE = false; // Set to false for production

  const [step, setStep] = useState<Step | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: "",
    username: "",
  });

  const [categories, setCategories] = useState<string[]>([]);
  const [reminder, setReminder] = useState("none");
  const [reminderTime, setReminderTime] = useState("13:00");
  const [whereHeard, setWhereHeard] = useState("");

  const usernameInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isMobile === null) return;
    setStep(isMobile ? "intro" : "email");
  }, [isMobile]);

  if (step === null) return null;

  /* ---------------- API: SEND OTP ---------------- */
  const handleEmailContinue = async () => {
    if (!formData.email.includes("@")) return;

    setIsLoading(true);
    setError(null);

    try {
      await sendOTP(formData.email);
      setStep("check-email");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send OTP. Please try again.");
      console.error("Send OTP error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------- API: VERIFY OTP ---------------- */
  const handleVerifyOTP = async (code: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await verifyOTP(formData.email, code);
      
      // Check if this is a new user or existing user
      if (response.isNewUser || !response.user.isInboxCreated) {
        // New user - continue with signup flow
        setStep("username");
      } else {
        // Existing user with inbox - redirect to inbox
        router.push("/inbox");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
      console.error("Verify OTP error:", err);
      throw err; // Re-throw to show error in VerifyCode component
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------- RESEND OTP ---------------- */
  const handleResendOTP = async () => {
    try {
      await sendOTP(formData.email);
    } catch (err: any) {
      console.error("Resend OTP error:", err);
    }
  };

  const handleFinalSubmit = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push("/inbox");
    }, 800);
  };

  const handleBack = () => {
    if (step === "email") {
      if (isMobile) setStep("intro");
      return;
    }

    if (step === "check-email") setStep("email");
    else if (step === "username") setStep("check-email");
    else if (step === "categories") setStep("username");
    else if (step === "reminder") setStep("categories");
    else if (step === "where") setStep("reminder"); // ✅ added
    else if (step === "notify") {
      setStep("where"); // ✅ mobile-only
    }
  };

  const showCarousel = step === "email" || step === "check-email";

  /* ---------------- MOBILE ---------------- */

  if (isMobile) {
    return (
      <>
        <SEOHead title="Sign up" description="Create an account" />

        <MobileSignupSection
          step={step}
          formData={formData}
          setFormData={setFormData}
          categories={categories}
          setCategories={setCategories}
          reminder={reminder}
          setReminder={setReminder}
          reminderTime={reminderTime}
          setReminderTime={setReminderTime}
          whereHeard={whereHeard}
          setWhereHeard={setWhereHeard}
          isLoading={isLoading}
          usernameInputRef={usernameInputRef}
          onEmailContinue={handleEmailContinue}
          onVerifyOTP={handleVerifyOTP}
          onResendOTP={handleResendOTP}
          onFinalSubmit={handleFinalSubmit}
          onBack={handleBack}
          setStep={setStep}
          devMode={DEV_MODE}
        />
      </>
    );
  }

  /* ---------------- DESKTOP ---------------- */

  return (
    <>
      <SEOHead title="Sign up" description="Create an account" />

      <div className="flex h-screen bg-white">
        {showCarousel && (
          <div className="hidden lg:flex w-1/2 h-full">
            <AuthCarousel />
          </div>
        )}

        <div
          className={`
            flex flex-col relative text-[#0C1014]
            ${showCarousel ? "w-full lg:w-1/2" : "w-full items-center justify-center"}
          `}
        >
          <div
            className={`
              flex flex-col items-center justify-center
              px-10
              ${showCarousel ? "flex-1" : "w-full max-w-[700px] mx-auto"}
            `}
          >
            {showCarousel && (
              <Image
                src="/logos/inbo-logo.png"
                width={140}
                height={55}
                alt="Logo"
                className="mb-10"
              />
            )}

            <div className="w-full max-w-[380px]">
              {step === "email" && (
                <EmailStep
                  formData={formData}
                  setFormData={setFormData}
                  onContinue={handleEmailContinue}
                  googleLogin={() => {}}
                  isLoading={isLoading}
                  devMode={DEV_MODE}
                />
              )}

              {step === "check-email" && (
                <VerifyCodePage
                  email={formData.email}
                  onResend={handleResendOTP}
                  onVerify={handleVerifyOTP}
                  onSimulateOpen={() => setStep("username")}
                  devMode={DEV_MODE}
                />
              )}

              {step === "username" && (
                <UsernameStep
                  ref={usernameInputRef}
                  formData={formData}
                  setFormData={setFormData}
                  onContinue={() => setStep("categories")}
                  onBack={handleBack}
                />
              )}

              {step === "categories" && (
                <CategoriesStep
                  categories={categories}
                  toggleCategory={(c: string) =>
                    setCategories((prev) =>
                      prev.includes(c)
                        ? prev.filter((x) => x !== c)
                        : [...prev, c]
                    )
                  }
                  onContinue={() => setStep("reminder")}
                  onBack={handleBack}
                />
              )}

              {step === "reminder" && (
                <ReminderStep
                  reminder={reminder}
                  setReminder={setReminder}
                  reminderTime={reminderTime}
                  setReminderTime={setReminderTime}
                  onContinue={() => setStep("where")}
                  onBack={handleBack}
                />
              )}

              {step === "where" && (
                <WhereStep
                  whereHeard={whereHeard}
                  setWhereHeard={setWhereHeard}
                  onContinue={handleFinalSubmit}
                  onBack={handleBack}
                  isLoading={isLoading}
                />
              )}
            </div>

            <div className="mt-10 text-center">
              <span className="text-[#6F7680] mr-2 text-lg">Language</span>
              <select
                value={i18n.language}
                onChange={(e) => i18n.changeLanguage(e.target.value)}
                className="text-[#0C1014] font-semibold text-md bg-transparent border-none outline-none cursor-pointer"
              >
                <option value="en">English (US)</option>
                <option value="fr">Français</option>
                <option value="es">Español</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
