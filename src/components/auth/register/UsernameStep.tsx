"use client";

import React, { forwardRef, useState, useEffect, useCallback } from "react";
import { CheckCircle2, AlertCircle, XCircle, Loader2 } from "lucide-react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { userService } from "@/services/user";

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

/* =========================
   STABLE SUB-COMPONENTS
========================== */

const UsernameInput = ({
    formData,
    setFormData,
    setSelectedSuggestion,
    inputRef,
    isMobile,
    isChecking,
    isAvailable,
    availabilityMessage,
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
            const v = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
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
        {isChecking ? (
          <p className="text-[#6F7680] text-sm flex items-center gap-1">
            <Loader2 size={16} className="animate-spin" /> Checking...
          </p>
        ) : formData.username && formData.username.length >= 2 ? (
          isAvailable ? (
            <p className="text-green-600 text-sm flex items-center gap-1">
              <CheckCircle2 size={16} /> {availabilityMessage || "Available"}
            </p>
          ) : (
            <p className="text-red-500 text-sm flex items-center gap-1">
              <XCircle size={16} /> {availabilityMessage || "Not available"}
            </p>
          )
        ) : formData.username ? (
          <p className="text-red-500 text-xs">
            Enter at least 2 characters
          </p>
        ) : null}
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

interface UsernameStepProps {
  formData: { username: string; [key: string]: any };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onContinue: () => Promise<void> | void;
  onBack: () => void;
}

const UsernameStep = forwardRef(function UsernameStep(
  {
    formData,
    setFormData,
    onContinue,
    onBack,
  }: UsernameStepProps,
  ref: any
) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // State for suggestions, availability, and loading
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [availabilityMessage, setAvailabilityMessage] = useState<string>("");
  const [isChecking, setIsChecking] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string>("");
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Debounce username input
  const debouncedUsername = useDebounce(formData.username, 500);

  // Fetch suggested usernames on mount
  useEffect(() => {
    const fetchSuggestions = async () => {
      setLoadingSuggestions(true);
      try {
        const response = await userService.getSuggestedUsernames();
        if (response.success && response.suggestions) {
          setSuggestions(response.suggestions);
        }
      } catch (err) {
        console.error("Failed to fetch suggestions:", err);
        // Use fallback suggestions
        setSuggestions(["user123", "reader456", "inbox789"]);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    fetchSuggestions();
  }, []);

  // Check availability when username changes
  useEffect(() => {
    const checkAvailability = async () => {
      if (!debouncedUsername || debouncedUsername.length < 2) {
        setIsAvailable(null);
        setAvailabilityMessage("");
        return;
      }

      setIsChecking(true);
      setError("");

      try {
        const response = await userService.checkInboxAvailability(debouncedUsername);
        setIsAvailable(response.is_available);
        setAvailabilityMessage(response.message || (response.is_available ? "Username is available!" : "Username is taken"));
      } catch (err: any) {
        console.error("Availability check failed:", err);
        setIsAvailable(false);
        setAvailabilityMessage(err?.response?.data?.message || "Could not check availability");
      } finally {
        setIsChecking(false);
      }
    };

    checkAvailability();
  }, [debouncedUsername]);

  // Handle continue button
  const handleContinue = async () => {
    if (!formData.username || formData.username.length < 2) {
      setError("Please enter a username with at least 2 characters");
      return;
    }

    if (!isAvailable) {
      setError("Please choose an available username");
      return;
    }

    setIsCreating(true);
    setError("");

    try {
      const response = await userService.createInbox(formData.username);
      if (response.success) {
        // Inbox created successfully, proceed to next step
        await onContinue();
      } else {
        setError(response.message || "Failed to create inbox");
      }
    } catch (err: any) {
      console.error("Inbox creation failed:", err);
      setError(err?.response?.data?.message || "Failed to create inbox. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (username: string) => {
    setSelectedSuggestion(username);
    setFormData((p: any) => ({ ...p, username }));
    // Immediately set as available since suggestions are pre-checked
    setIsAvailable(true);
    setAvailabilityMessage("Username is available!");
  };

  const canContinue = formData.username && formData.username.length >= 2 && isAvailable && !isChecking;

  /* =========================
     MOBILE LAYOUT
  ========================== */

  if (isMobile) {
    return (
      <div className="max-h-screen flex flex-col bg-white">
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
            isChecking={isChecking}
            isAvailable={isAvailable}
            availabilityMessage={availabilityMessage}
          />
          
          {loadingSuggestions ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="animate-spin text-[#6F7680]" size={24} />
            </div>
          ) : suggestions.length > 0 && (
            <Suggestions
              list={suggestions}
              selectedSuggestion={selectedSuggestion}
              setSelectedSuggestion={handleSuggestionClick}
              setFormData={setFormData}
            />
          )}

          {error && (
            <div className="mt-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </div>

        <div
          className="fixed bottom-0 left-0 right-0 bg-white"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="px-4 pt-3 pb-4">
            <MobileWarning />
            <button
              onClick={handleContinue}
              disabled={!canContinue || isCreating}
              className={`mt-4 w-full py-4 rounded-2xl text-[16px] font-medium transition
                ${canContinue && !isCreating
                  ? "bg-[#C46A54] text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
            >
              {isCreating ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={20} className="animate-spin" /> Creating...
                </span>
              ) : (
                "Continue"
              )}
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
            isMobile={false}
            isChecking={isChecking}
            isAvailable={isAvailable}
            availabilityMessage={availabilityMessage}
          />
          
          {loadingSuggestions ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="animate-spin text-[#6F7680]" size={24} />
            </div>
          ) : suggestions.length > 0 && (
            <Suggestions
              list={suggestions}
              selectedSuggestion={selectedSuggestion}
              setSelectedSuggestion={handleSuggestionClick}
              setFormData={setFormData}
            />
          )}
          
          <DesktopWarning />

          {error && (
            <div className="mt-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </div>

        <button
          onClick={handleContinue}
          disabled={!canContinue || isCreating}
          className={`w-full mt-8 py-4 rounded-full text-[16px] font-medium transition
            ${canContinue && !isCreating
              ? "bg-[#C46A54] text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
        >
          {isCreating ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={20} className="animate-spin" /> Creating inbox...
            </span>
          ) : (
            "Start reading"
          )}
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
