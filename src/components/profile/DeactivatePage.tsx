"use client";

import { ArrowLeft } from "lucide-react";
import { useState } from "react";

export default function DeactivatePage({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState(1);
  const [reason, setReason] = useState("");
  const [answers, setAnswers] = useState({
    q1: "",
    q2: "",
    q3: "",
  });
  const [breakWord, setBreakWord] = useState("");
  const [otp, setOtp] = useState("");

  const reasons = [
    "The pricing is confusing",
    "The product is too difficult to use",
    "I chose a different solution",
    "The pricing is too high",
    "I don't read newsletters",
    "The product lacks the necessary features",
    "Others (Please explain)",
  ];

  return (
    <div className="p-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 mb-6 text-black text-sm font-semibold capitalize"
      >
        <ArrowLeft size={18} /> back
      </button>

      {/* -------------------------------------------- */}
      {/* STEP 1 — SELECT REASON                       */}
      {/* -------------------------------------------- */}

      {step === 1 && (
        <div className="bg-white p-6 rounded-xl border border-[#EEEFF2] shadow-[0_4px_24px_rgba(219,219,219,0.25)]">
          <h2 className="text-[#0C1014] text-xl font-semibold mb-2">Deactivate</h2>

          <h3 className="text-2xl font-semibold mb-2 flex items-center gap-2">
            🥺 Don’t deactivate your account!
          </h3>

          <p className="text-gray-500 mb-6">Give us a second chance!</p>

          <p className="text-[#0C1014] mb-4">
            Please take a moment to let us know why you are deactivating:
          </p>

          {/* Reason List */}
          <div className="flex flex-col gap-4">
            {reasons.map((r) => (
              <div
                key={r}
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => setReason(r)}
              >
                {/* Custom Radio */}
                <div className="w-6 h-6 rounded-full border-[2px] border-[#C46A54] flex items-center justify-center">
                  {reason === r && (
                    <div className="w-3 h-3 bg-[#C46A54] rounded-full" />
                  )}
                </div>

                <span className="text-[#0C1014] text-base">{r}</span>
              </div>
            ))}
          </div>

          {/* Next Button */}
          <button
            disabled={!reason}
            onClick={() => setStep(2)}
            className={`
              mt-8 px-6 py-3 rounded-full text-base font-semibold
              ${
                reason
                  ? "bg-[#E55E3A] text-white shadow-[0_2px_10px_rgba(229,94,58,0.3)]"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }
            `}
          >
            Next
          </button>
        </div>
      )}

      {/* -------------------------------------------- */}
      {/* STEP 2 — FEEDBACK QUESTIONS                  */}
      {/* -------------------------------------------- */}

      {step === 2 && (
        <div className="bg-white p-6 rounded-xl border border-[#EEEFF2] shadow-[0_4px_24px_rgba(219,219,219,0.25)]">
          <h2 className="text-[#0C1014] text-xl font-semibold">Deactivate</h2>

          <div className="flex items-center gap-2 mt-2 mb-2">
            {/* Selected reason indicator */}
            <div className="w-5 h-5 rounded-full border-[2px] border-[#C46A54] flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-[#C46A54] rounded-full" />
            </div>

            <span className="text-[#0C1014]">{reason}</span>

            <button className="text-[#2D6DE9] text-sm ml-2" onClick={() => setStep(1)}>
              Change
            </button>
          </div>

          <h3 className="text-2xl font-semibold mt-3 mb-1">
            Help us become a better version!
          </h3>

          <p className="text-gray-500 mb-6">
            Just 3 quick questions before you go. Your feedback helps us improve Inbo.
          </p>

          {/* Question 1 */}
          <label className="text-[#C46A54] font-medium">What didn’t work well for you?</label>
          <textarea
            className="w-full border border-[#E2E4E9] rounded-xl p-4 h-32 mt-2 placeholder:text-[#A0A4A9] resize-none"
            placeholder="Let us know what we could have done better."
            maxLength={500}
            value={answers.q1}
            onChange={(e) => setAnswers({ ...answers, q1: e.target.value })}
          />
          <span className="text-sm text-gray-400 block mb-4">{answers.q1.length}/500</span>

          {/* Question 2 */}
          <label className="text-[#C46A54] font-medium mt-6">
            What did you enjoy or find useful in Inbo?
          </label>
          <textarea
            className="w-full border border-[#E2E4E9] rounded-xl p-4 h-32 mt-2 placeholder:text-[#A0A4A9] resize-none"
            placeholder="Describe your experience"
            maxLength={500}
            value={answers.q2}
            onChange={(e) => setAnswers({ ...answers, q2: e.target.value })}
          />
          <span className="text-sm text-gray-400 block mb-4">{answers.q2.length}/500</span>

          {/* Question 3 */}
          <label className="text-[#C46A54] font-medium mt-6">
            Which other app do you use for reading newsletters?
          </label>
          <textarea
            className="w-full border border-[#E2E4E9] rounded-xl p-4 h-32 mt-2 placeholder:text-[#A0A4A9] resize-none"
            placeholder="Describe your experience"
            maxLength={500}
            value={answers.q3}
            onChange={(e) => setAnswers({ ...answers, q3: e.target.value })}
          />
          <span className="text-sm text-gray-400 block mb-4">{answers.q3.length}/500</span>

          {/* Buttons */}
          <div className="flex gap-3 mt-8">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-3 rounded-full bg-gray-100 text-[#0C1014] font-semibold"
            >
              Back
            </button>

            <button
              onClick={() => setStep(3)}
              className="px-6 py-3 rounded-full bg-[#E55E3A] text-white font-semibold shadow-[0_2px_10px_rgba(229,94,58,0.3)]"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* -------------------------------------------- */}
      {/* STEP 3 — FINAL CONFIRMATION                  */}
      {/* -------------------------------------------- */}

      {step === 3 && (
        <div className="bg-white p-6 rounded-xl border border-[#EEEFF2] shadow-[0_4px_24px_rgba(219,219,219,0.25)]">
          <h2 className="text-[#0C1014] text-xl font-semibold mb-2">Deactivate</h2>

          <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            🥺 This is last step, think one time more!
          </h3>

          {/* Experience Textarea */}
          <textarea
            className="w-full border border-[#E2E4E9] rounded-xl p-4 h-32 placeholder:text-[#A0A4A9] resize-none"
            placeholder="Describe your experience"
          />
          <span className="text-sm text-gray-400">0/500</span>

          <p className="mt-6 text-[#0C1014]">
            Please enter <strong>“BREAK”</strong> and OTP (sent to your registered email) to confirm.
          </p>

          {/* BREAK Field */}
          <div className="mt-4">
            <label className="text-sm font-medium">Type “BREAK”</label>
            <input
              className="w-full mt-1 p-3 border border-[#E2E4E9] rounded-lg placeholder:text-[#A0A4A9]"
              placeholder="Type here..."
              value={breakWord}
              onChange={(e) => setBreakWord(e.target.value)}
            />
          </div>

          {/* OTP Field */}
          <div className="mt-4">
            <label className="text-sm font-medium">Enter OTP</label>
            <input
              className="w-full mt-1 p-3 border border-[#E2E4E9] rounded-lg placeholder:text-[#A0A4A9]"
              placeholder="Enter 4 digit OTP here..."
              maxLength={4}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <button className="text-[#2D6DE9] text-sm mt-1">Resend OTP</button>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-8">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-3 rounded-full bg-gray-100 text-[#0C1014] font-semibold"
            >
              Back
            </button>

            <button
              disabled={breakWord !== "BREAK" || otp.length !== 4}
              className={`
                px-6 py-3 rounded-full font-semibold
                ${
                  breakWord === "BREAK" && otp.length === 4
                    ? "bg-[#C46A54] text-white shadow-[0_2px_10px_rgba(196,106,84,0.3)]"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }
              `}
            >
              Deactivate Account
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
