"use client";

import type { Step } from "@/app/auth/register/page";
import { CircleQuestionMark, ArrowLeftIcon } from "lucide-react";
// Steps
import EmailStep from "@/components/auth/register/EmailStep";
import VerifyCodePage from "@/components/auth/register/VerifyCode";
import UserDetailsStep from "@/components/auth/register/UserDetailsStep";
import UsernameStep from "@/components/auth/register/UsernameStep";
import CategoriesStep from "@/components/auth/register/CategoriesStep";
import ReminderStep from "@/components/auth/register/ReminderStep";
import WhereStep from "@/components/auth/register/WhereHeardStep";

// Final
import NotifyStep from "@/components/auth/register/NotifyStep";

// Intro
import { IntroStep } from "@/components/auth/register/IntroStep";

// Language selector
import LanguageSelector from "@/components/LanguageSelector";

const STEP_ORDER: Step[] = [
  "intro",
  "email",
  "check-email",
  "user-details",
  "username",
  "categories",
  "reminder",
  "where",
  "notify",
];

const HEADER_HEIGHT = "h-[72px]";

export default function MobileSignupSection(props: any) {
  const {
    step,
    formData,
    setFormData,
    categories,
    setCategories,
    reminder,
    setReminder,
    reminderTime,
    setReminderTime,
    whereHeard,
    setWhereHeard,
    isLoading,
    usernameInputRef,
    onEmailContinue,
    onVerifyOTP,
    onResendOTP,
    onFinalSubmit,
    onBack,
    setStep,
    devMode,
  } = props;

  const isIntroFlow =
    step === "intro" || step === "email" || step === "check-email";

  // ✅ Show help icon ONLY on email + verify steps
  const showHelpIcon = step === "email" || step === "check-email";

  return (
    <div className="relative min-h-[100dvh] bg-white text-black overscroll-none">
      {/* BACKGROUND */}
      {isIntroFlow && (
        <div className="pointer-events-none absolute inset-0 z-0">
          <div
            className="h-full w-full bg-[#C76B55]"
            style={{
              backgroundImage: "url('/images/newsletter-bg.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        </div>
      )}

      {/* FIXED HEADER */}
      {step !== "intro" && (
        <div
          className={`
            fixed top-0 left-0 right-0 z-40
            ${HEADER_HEIGHT}
            flex items-center justify-between
            px-6
            ${isIntroFlow
              ? "text-white bg-transparent"
              : "text-black bg-white"
            }
        `}
        >
          {/* Back */}
          <button
            onClick={onBack}
            className="flex h-8 w-8 items-center justify-center"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>

          {/* Progress pills */}
          <div className="flex items-center gap-1.5">
            {STEP_ORDER.map((s) => {
              const isActive = s === step;

              return (
                <span
                  key={s}
                  className={`
                    h-2 rounded-full transition-all duration-300
                    ${isActive ? "w-6" : "w-2"}
                    ${isIntroFlow
                      ? isActive
                        ? "bg-white"
                        : "bg-white/40"
                      : isActive
                        ? "bg-[#C76B55]"
                        : "bg-gray-300"
                    }
                `}
                />
              );
            })}
          </div>

          {/* Help icon */}
          {showHelpIcon ? (
            <span className="flex h-8 w-8 items-center justify-center text-white/70">
              <CircleQuestionMark className="h-6 w-6" />
            </span>
          ) : (
            <span className="w-8" />
          )}
        </div>

      )}

      {/* MAIN */}
      <div
        className={`
          relative z-10 flex min-h-[100dvh] flex-col
          ${step !== "intro" ? "pt-[72px]" : ""}
        `}
      >
        {/* INTRO */}
        {step === "intro" && (
          <IntroStep onEmail={() => setStep("email")} />
        )}

        {/* EMAIL + CHECK EMAIL */}
        {isIntroFlow && step !== "intro" && (
          <div
            className="
              mt-auto
              h-[80dvh]
              rounded-t-3xl
              bg-white
              px-6 pt-8 pb-10
              overflow-y-auto
              transform transition-transform duration-300 ease-out
              animate-slideUp
              will-change-transform
            "
          >
            {step === "email" && (
              <>
                <EmailStep
                  formData={formData}
                  setFormData={setFormData}
                  onContinue={onEmailContinue}
                  googleLogin={() => { }}
                  isLoading={isLoading}
                  devMode={devMode}
                />
                <div className="mt-6 flex justify-center">
                  <LanguageSelector variant="compact" labelPosition="inline" />
                </div>
              </>
            )}

            {step === "check-email" && (
              <VerifyCodePage
                email={formData.email}
                onResend={onResendOTP}
                onVerify={onVerifyOTP}
                onSimulateOpen={() => setStep("username")}
                devMode={devMode}
              />
            )}
          </div>
        )}

        {/* POST INTRO FLOW */}
        {!isIntroFlow && (
          <div className="flex-1 bg-white">
            <div className="flex-1 overflow-y-auto px-6 pt-10">
              {step === "user-details" && (
                <UserDetailsStep
                  formData={formData}
                  setFormData={setFormData}
                  onContinue={() => setStep("username")}
                  onBack={onBack}
                />
              )}

              {step === "username" && (
                <UsernameStep
                  ref={usernameInputRef}
                  formData={formData}
                  setFormData={setFormData}
                  onContinue={() => setStep("categories")}
                  onBack={onBack}
                />
              )}

              {step === "categories" && (
                <CategoriesStep
                  categories={categories}
                  toggleCategory={(c: string) =>
                    setCategories((prev: string[]) =>
                      prev.includes(c)
                        ? prev.filter((x) => x !== c)
                        : [...prev, c]
                    )
                  }
                  onContinue={() => setStep("reminder")}
                  onBack={onBack}
                />
              )}

              {step === "reminder" && (
                <ReminderStep
                  reminder={reminder}
                  setReminder={setReminder}
                  reminderTime={reminderTime}
                  setReminderTime={setReminderTime}
                  onContinue={() => setStep("where")}
                  onBack={onBack}
                />
              )}

              {step === "where" && (
                <WhereStep
                  whereHeard={whereHeard}
                  setWhereHeard={setWhereHeard}
                  categories={categories}
                  reminder={reminder}
                  reminderTime={reminderTime}
                  onContinue={() => setStep("notify")}
                  onBack={onBack}
                />
              )}

              {step === "notify" && (
                <NotifyStep
                  onAllow={onFinalSubmit}
                  onSkip={onFinalSubmit}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
