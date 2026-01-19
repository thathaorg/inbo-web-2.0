"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/seo/SEOHead";
import AuthCarousel from "@/components/auth/AuthCarousel";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useAuth } from "@/contexts/AuthContext";
import { userService } from "@/services/user";
import LanguageSelector from "@/components/LanguageSelector";

// Mobile section
import MobileSignupSection from "@/app/auth/register/MobileSignupSection";

// Steps
import EmailStep from "@/components/auth/register/EmailStep";
import VerifyCodePage from "@/components/auth/register/VerifyCode";
import UserDetailsStep from "@/components/auth/register/UserDetailsStep";
import UsernameStep from "@/components/auth/register/UsernameStep";
import CategoriesStep from "@/components/auth/register/CategoriesStep";
import ReminderStep from "@/components/auth/register/ReminderStep";
import WhereStep from "@/components/auth/register/WhereHeardStep";

export type Step =
  | "intro"
  | "email"
  | "check-email"
  | "user-details"
  | "username"
  | "categories"
  | "reminder"
  | "where"
  | "notify";

export default function SignupPage() {
  const router = useRouter();
  const { t } = useTranslation("auth");
  const { sendOTP, verifyOTP } = useAuth();

  const isMobile = useMediaQuery("(max-width: 768px)");
  const DEV_MODE = false; // Set to false for production

  const [step, setStep] = useState<Step | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: "",
    username: "",
    name: "",
    birthYear: "",
    gender: "",
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
      setError(err.response?.data?.message || t("login.otpFailed"));
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
        // Step 1 of onboarding: User Details
        setStep("user-details");
      } else {
        // Existing user with inbox - redirect to inbox
        router.push("/inbox");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t("otp.invalidCode"));
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

  /* ---------------- API: COMPLETE ONBOARDING ---------------- */
  const handleFinalSubmit = async () => {
    setIsLoading(true);
    try {
      // 1. Submit onboarding data
      await userService.completeOnboarding({
        username: formData.username,
        categories: categories,
        reminder: reminder,
        reminderTime: reminderTime,
        whereHeard: whereHeard,
      });

      // 2. Retry updating profile (in case it failed earlier or was skipped)
      // This ensures name/gender/birthYear are saved if the user record is now fully established.
      if (formData.name || formData.birthYear || formData.gender) {
        try {
          await userService.updateProfile({
            name: formData.name,
            birthYear: formData.birthYear,
            gender: formData.gender,
          });
        } catch (profileErr) {
          console.warn("Final profile update attempt failed:", profileErr);
          // Ignore error and proceed to inbox
        }
      }

      router.push("/inbox");
    } catch (err: any) {
      console.error("Onboarding failed:", err);
      // Even if it fails, try to go to inbox as user is created
      router.push("/inbox");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === "email") {
      if (isMobile) setStep("intro");
      return;
    }

    if (step === "check-email") setStep("email");
    else if (step === "user-details") setStep("check-email"); // Back to verify? Or email? Maybe verify is weird if already authenticated.
    else if (step === "username") setStep("user-details");
    else if (step === "categories") setStep("username");
    else if (step === "reminder") setStep("categories");
    else if (step === "where") setStep("reminder");
    else if (step === "notify") {
      setStep("where");
    }
  };

  const showCarousel = step === "email" || step === "check-email";

  /* ---------------- MOBILE ---------------- */

  if (isMobile) {
    // If we are in user-details step on mobile, we render it directly
    // This assumes MobileSignupSection handles other steps, we need to inject it or modify MobileSignupSection.
    // Ideally MobileSignupSection should handle all steps. 
    // For now, let's render UserDetailsStep conditionally here if step matches
    if (step === "user-details") {
      return (
        <UserDetailsStep
          formData={formData}
          setFormData={setFormData}
          onContinue={() => setStep("username")}
          onBack={handleBack}
        />
      );
    }

    return (
      <>
        <SEOHead title={t("register.title")} description="Create an account" />

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
      <SEOHead title={t("register.title")} description="Create an account" />

      <div className="flex h-screen overflow-hidden bg-white">
        {showCarousel && (
          <div className="hidden lg:flex w-1/2 h-full">
            <AuthCarousel />
          </div>
        )}

        <div
          className={`
            flex flex-col relative text-[#0C1014] h-full overflow-y-auto
            ${showCarousel ? "w-full lg:w-1/2" : "w-full items-center justify-center"}
          `}
        >
          <div
            className={`
              flex flex-col items-center justify-center min-h-full
              px-10 py-6
              ${showCarousel ? "flex-1" : "w-full max-w-[700px] mx-auto"}
            `}
          >
            {showCarousel && (
              <Image
                src="/logos/inbo-logo.png"
                width={140}
                height={55}
                alt="Logo"
                className="mb-6 flex-shrink-0"
              />
            )}

            <div className="w-full max-w-[380px] flex-shrink-0">
              {step === "email" && (
                <EmailStep
                  formData={formData}
                  setFormData={setFormData}
                  onContinue={handleEmailContinue}
                  googleLogin={() => { }}
                  isLoading={isLoading}
                  devMode={DEV_MODE}
                />
              )}

              {step === "check-email" && (
                <VerifyCodePage
                  email={formData.email}
                  onResend={handleResendOTP}
                  onVerify={handleVerifyOTP}
                  onSimulateOpen={() => {
                    // For Dev Mode Simulation
                    setStep("user-details");
                  }}
                  devMode={DEV_MODE}
                />
              )}

              {step === "user-details" && (
                <UserDetailsStep
                  formData={formData}
                  setFormData={setFormData}
                  onContinue={() => setStep("username")}
                  onBack={handleBack}
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
                  categories={categories}
                  reminder={reminder}
                  reminderTime={reminderTime}
                  onContinue={handleFinalSubmit}
                  onBack={handleBack}
                />
              )}
            </div>

            <div className="mt-6 text-center flex-shrink-0">
              <LanguageSelector variant="default" labelPosition="inline" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
