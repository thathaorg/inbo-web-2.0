"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

/* ---------------- MEDIA QUERY ---------------- */
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

type VerifyCodePageProps = {
  email: string;
  onResend?: () => void;
  onSimulateOpen?: () => void;
  onVerify?: (code: string) => Promise<void>;
  devMode?: boolean;
};

export default function VerifyCodePage({
  email,
  onResend,
  onSimulateOpen,
  onVerify,
  devMode = false,
}: VerifyCodePageProps) {
  const isMobile = useMediaQuery("(max-width: 640px)");
  const { t } = useTranslation("auth");

  const [code, setCode] = useState<string[]>(["", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState(false);

  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  /* ---------------- TIMER ---------------- */
  useEffect(() => {
    if (timer <= 0) {
      setTimer(0);
      return;
    }

    const interval = setInterval(() => {
      setTimer((t) => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  /* ---------------- AUTO SUBMIT ---------------- */
  useEffect(() => {
    const verifyCode = async () => {
      const allFilled = code.every((d) => d !== "");
      
      if (allFilled && !isVerifying && !hasError) {
        const finalCode = code.join("");
        
        // Validate OTP is exactly 4 digits
        if (finalCode.length !== 4 || !/^\d{4}$/.test(finalCode)) {
          console.error("Invalid OTP format:", finalCode);
          return;
        }
        
        setIsVerifying(true);
        setHasError(false);

        try {
          if (onVerify) {
            console.log("Verifying OTP:", finalCode);
            await onVerify(finalCode);
          } else if (devMode && onSimulateOpen) {
            // Dev mode fallback
            setTimeout(onSimulateOpen, 300);
          }
        } catch (error: any) {
          console.error("OTP verification error:", error?.response?.data || error);
          setHasError(true);
          setErrorMessage(
            error?.response?.data?.message || 
            error?.message || 
            "Invalid or expired OTP. Please try again."
          );
          // Clear the code on error so user can re-enter
          setCode(["", "", "", ""]);
          inputsRef.current[0]?.focus();
        } finally {
          setIsVerifying(false);
        }
      }
    };

    verifyCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  /* ---------------- HANDLERS ---------------- */
  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;

    const next = [...code];
    next[index] = value;
    setCode(next);
    setHasError(false);
    setErrorMessage("");

    if (value && index < 3) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 4);
    if (/^\d+$/.test(pastedData)) {
      const digits = pastedData.split("");
      const newCode = [...code];
      digits.forEach((digit, i) => {
        if (i < 4) newCode[i] = digit;
      });
      setCode(newCode);
      // Focus last filled input or the next empty one
      const lastIndex = Math.min(digits.length, 3);
      inputsRef.current[lastIndex]?.focus();
    }
  };

  const handleResend = () => {
    if (timer !== 0) return;

    setTimer(60);
    setCode(["", "", "", ""]);
    setHasError(false);
    setErrorMessage("");
    inputsRef.current[0]?.focus();
    onResend?.();
  };

  /* ======================================================
     MOBILE SECTION (NEW — MATCHES IMAGE UI)
     ====================================================== */
  if (isMobile) {
    return (
      <div className="px-4 text-center">
        <h1 className="text-[26px] font-semibold text-[#0C1014]">
          {t("otp.title")}
        </h1>

        <p className="mt-3 text-[15px] text-[#6F7680] leading-[22px]">
          {t("otp.subtitle")}
          <br />
          <span className="font-medium text-[#0C1014]">{email}</span>
        </p>

        {/* OTP INPUTS */}
        <div className="flex justify-center gap-3 mt-8">
          {code.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                inputsRef.current[i] = el;
              }}
              value={digit}
              onChange={(e) => handleChange(e.target.value, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              onPaste={handlePaste}
              maxLength={1}
              inputMode="numeric"
              disabled={isVerifying}
              className={`
                w-[56px] h-[56px]
                rounded-2xl
                text-center
                text-[22px]
                font-semibold
                outline-none
                transition
                ${isVerifying ? "opacity-50" : ""}
                ${
                  hasError
                    ? "border-2 border-red-500 bg-red-50"
                    : "border border-[#DADDE2] bg-[#F7F7F8]"
                }
              `}
            />
          ))}
        </div>

        {/* ERROR MESSAGE */}
        {hasError && (
          <p className="mt-4 text-[15px] text-red-500">
            {errorMessage || "This OTP doesn't match. Recheck and enter again."}
          </p>
        )}
        {/* VERIFYING STATE */}
        {isVerifying && (
          <p className="mt-4 text-[15px] text-[#6F7680]">
            Verifying...
          </p>
        )}
        {/* TIMER / RESEND */}
        <p className="mt-6 text-[15px] text-[#6F7680]">
          Didn’t receive the code?{" "}
          {timer === 0 ? (
            <button
              onClick={handleResend}
              className="text-[#C46A54] font-medium"
            >
              Resend code
            </button>
          ) : (
            <span>(00:{String(timer).padStart(2, "0")})</span>
          )}
        </p>
      </div>
    );
  }

  /* ======================================================
     DESKTOP SECTION (UNCHANGED — YOUR CODE)
     ====================================================== */
  return (
    <div className="w-full flex flex-col items-center text-center">
      <h1 className="text-[28px] sm:text-[32px] font-semibold text-[#0C1014]">
        {t("otp.title")}
      </h1>

      <p className="mt-3 text-[16px] leading-[22px] text-[#6F7680]">
        {t("otp.subtitle")}
        <br />
        <span className="font-medium text-[#0C1014]">{email}</span>
      </p>

      {/* OTP INPUTS */}
      <div className="flex gap-3 mt-8">
        {code.map((digit, i) => (
          <input
            key={i}
            ref={(el) => {
              inputsRef.current[i] = el;
            }}
            value={digit}
            onChange={(e) => handleChange(e.target.value, i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            onPaste={handlePaste}
            maxLength={1}
            inputMode="numeric"
            autoFocus={i === 0}
            disabled={isVerifying}
            className={`
              w-[56px] h-[56px]
              rounded-xl
              border
              text-center
              text-[22px]
              font-medium
              outline-none
              transition
              ${isVerifying ? "opacity-50" : ""}
              ${hasError ? "border-red-500 bg-red-50" : digit ? "border-black" : "border-[#DADDE2] bg-[#F7F7F8]"}
              focus:border-black
            `}
          />
        ))}
      </div>

      {/* ERROR MESSAGE */}
      {hasError && (
        <p className="mt-4 text-[15px] text-red-500">
          {errorMessage || "Invalid OTP. Please try again."}
        </p>
      )}

      {/* VERIFYING STATE */}
      {isVerifying && (
        <p className="mt-4 text-[15px] text-[#6F7680]">
          Verifying...
        </p>
      )}

      {/* TIMER / RESEND */}
      <p className="mt-6 text-[15px] text-[#6F7680]">
        Didn’t receive the code?{" "}
        {timer === 0 ? (
          <button
            onClick={handleResend}
            className="font-medium text-[#0C1014] underline"
          >
            Resend
          </button>
        ) : (
          <span className="font-medium">
            (00:{String(timer).padStart(2, "0")})
          </span>
        )}
      </p>

      {/* DEV MODE BUTTON */}
      {devMode && onSimulateOpen && (
        <button
          onClick={onSimulateOpen}
          className="
            mt-8
            px-6 py-3
            rounded-full
            bg-[#0C1014]
            text-white
            text-[15px]
            font-medium
            hover:bg-[#1C1F24]
            transition
          "
        >
          Simulate → Continue
        </button>
      )}
    </div>
  );
}
