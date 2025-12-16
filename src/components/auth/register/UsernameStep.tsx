"use client";

import React, { forwardRef } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const dummySuggestions = ["Alex", "AlexSmith", "Alex09"];

/* =========================
   STABLE SUB-COMPONENTS
========================== */

const UsernameInput = ({
    formData,
    setFormData,
    setSelectedSuggestion,
    inputRef,
    isMobile,
  }: any) => (
    <>
      <label className="text-[16px] md:text-[18px] text-[#6F7680]">
        Enter username
      </label>

      <div
        className={`
          mt-2 flex items-center border border-[#E5E7EB] bg-white
          overflow-hidden transition focus-within:border-[#C46A54]
          ${isMobile ? "rounded-2xl" : "rounded-full"}
        `}
      >
        <input
          ref={inputRef}
          type="text"
          placeholder="example34"
          value={formData.username}
          onChange={(e) => {
            const v = e.target.value;
            setFormData((p: any) => ({ ...p, username: v }));
            setSelectedSuggestion?.(null);
          }}
          className="flex-1 px-4 py-3.5 text-[15px] outline-none placeholder:text-[#A2AAB4]"
        />

        {/* suffix */}
        <div
          className={`
            p-2 text-md
            ${
              isMobile
                ? "bg-black text-white p-2 mr-2 border-black rounded-2xl"
                : "text-black px-4"
            }
          `}
        >
          @inbo.me
        </div>
      </div>

      <div className="mt-2 ml-2 h-[20px]">
        {formData.username && formData.username.length > 1 ? (
          <p className="text-green-600 text-sm flex items-center gap-1">
            <CheckCircle2 size={16} /> Available
          </p>
        ) : (
          <p className="text-red-500 text-xs">
            Enter at least 2 characters
          </p>
        )}
      </div>
    </>
  );


const Suggestions = ({ list, selectedSuggestion, setSelectedSuggestion, setFormData }: any) => (
  <>
    <div className="flex items-center justify-between mt-6 mb-2">
      <span className="text-[#6F7680] text-[16px]">
        Available options
      </span>
    </div>

    <div className="rounded-2xl bg-[#F3F4F6] overflow-hidden">
      {list.map((name: string) => {
        const selected =
          selectedSuggestion === name || name === selectedSuggestion;

        return (
          <button
            key={name}
            onClick={() => {
              setSelectedSuggestion?.(name);
              setFormData((p: any) => ({ ...p, username: name }));
            }}
            className={`w-full flex items-center justify-between px-4 py-4 border-b last:border-b-0 transition
              ${selected ? "bg-white" : "hover:bg-[#ECEDEF]"}`}
          >
            <span className="font-medium">{name}@inbo.me</span>
            <CheckCircle2 className="text-green-600" />
          </button>
        );
      })}
    </div>
  </>
);

const DesktopWarning = () => (
  <div className="mt-6 px-4 py-3 rounded-xl bg-[#FFF6EB] border border-[#FFDEBF] flex gap-3 items-start">
    <AlertCircle size={20} className="text-[#E59500] mt-[2px]" />
    <p className="text-[#E59500] text-[15px] font-medium leading-[20px]">
      You can’t change this later, so choose wisely!
    </p>
  </div>
);

const MobileWarning = () => (
  <div className="flex gap-2 items-start text-[#E59500]">
    <AlertCircle size={18} />
    <p className="text-sm font-medium">
      This email can’t be changed later, so pick one you’re happy with.
    </p>
  </div>
);

/* =========================
   MAIN COMPONENT
========================== */

const UsernameStep = forwardRef(function UsernameStep(
  {
    formData,
    setFormData,
    suggestions = [],
    selectedSuggestion,
    setSelectedSuggestion,
    onContinue,
    onBack,
  }: any,
  ref: any
) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const list = suggestions.length > 0 ? suggestions : dummySuggestions;

  /* =========================
     MOBILE LAYOUT
  ========================== */

  if (isMobile) {
    return (
      <div className="h-full flex flex-col bg-white">
        <div className="px-4 pt-6 text-center">
          <h1 className="text-[24px] font-bold text-[#0C1014]">
            Create your inbo email
          </h1>
          <p className="text-[#6F7680] mt-2">
            This will be your new email for newsletters
            <br />
            no spam, just good stuff.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pt-6 pb-40">
          <UsernameInput
            formData={formData}
            setFormData={setFormData}
            setSelectedSuggestion={setSelectedSuggestion}
            inputRef={ref}
            isMobile={true}
          />
          <Suggestions
            list={list}
            selectedSuggestion={selectedSuggestion}
            setSelectedSuggestion={setSelectedSuggestion}
            setFormData={setFormData}
          />
        </div>

        <div
          className="fixed bottom-0 left-0 right-0 bg-white"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="px-4 pt-3 pb-4">
            <MobileWarning />
            <button
              onClick={onContinue}
              className="mt-4 w-full bg-[#C46A54] text-white py-4 rounded-2xl text-[16px] font-medium"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* =========================
     DESKTOP LAYOUT
  ========================== */

  return (
    <div className="w-full h-full flex items-center justify-center bg-white">
      <div className="max-w-[420px] w-full text-center">
        <h1 className="text-[32px] font-bold text-[#0C1014]">
          Pick your INBO address!
        </h1>

        <p className="text-[#6F7680] mt-3">
          This will be your new email for newsletters
          <br />
          no spam, just good stuff.
        </p>

        <div className="mt-8 text-left">
          <UsernameInput
            formData={formData}
            setFormData={setFormData}
            setSelectedSuggestion={setSelectedSuggestion}
            inputRef={ref}
            ismobile={false}
          />
          <Suggestions
            list={list}
            selectedSuggestion={selectedSuggestion}
            setSelectedSuggestion={setSelectedSuggestion}
            setFormData={setFormData}
          />
          <DesktopWarning />
        </div>

        <button
          onClick={onContinue}
          className="w-full mt-8 bg-[#C46A54] text-white py-4 rounded-full text-[16px] font-medium"
        >
          Start reading
        </button>

        <button
          onClick={onBack}
          className="mt-3 text-[#6F7680] underline text-sm"
        >
          ← Back
        </button>
      </div>
    </div>
  );
});

export default UsernameStep;
