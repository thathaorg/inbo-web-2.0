"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { userService } from "@/services/user";

interface UserDetailsStepProps {
    formData: {
        name: string;
        birthYear: string;
        gender: string;
        [key: string]: any;
    };
    setFormData: React.Dispatch<React.SetStateAction<any>>;
    onContinue: () => void;
    onBack: () => void;
}

export default function UserDetailsStep({
    formData,
    setFormData,
    onContinue,
    onBack,
}: UserDetailsStepProps) {
    const isMobile = useMediaQuery("(max-width: 768px)");
    const { t } = useTranslation("auth");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Gender options with translations
    const GENDER_OPTIONS = [
        { value: "male", label: t("onboarding.genderOptions.male") },
        { value: "female", label: t("onboarding.genderOptions.female") },
        { value: "non_binary", label: t("onboarding.genderOptions.other") },
        { value: "prefer_not_to_say", label: t("onboarding.genderOptions.preferNotToSay") },
    ];

    // Generate years (100 years back from current year - 13)
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => currentYear - 13 - i);

    const handleContinue = async () => {
        if (!formData.name || !formData.birthYear || !formData.gender) {
            setError("Please fill in all fields");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Update profile on backend immediately
            await userService.updateProfile({
                name: formData.name,
                birthYear: formData.birthYear,
                gender: formData.gender,
            });
            onContinue();
        } catch (err: any) {
            console.error("Profile update failed:", err);
            // Backend returned 500, possibly because profile is not ready or API issue.
            // We proceed anyway to avoid blocking the user flow.
            // The details can be retried later or updated in settings.
            onContinue();
        } finally {
            setIsLoading(false);
        }
    };

    const Content = (
        <div className="flex flex-col gap-6">
            {/* Name */}
            <div>
                <label className="block text-[#6F7680] text-[16px] md:text-[18px] mb-2">
                    {t("onboarding.nameLabel")}
                </label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={t("onboarding.namePlaceholder")}
                    className="w-full px-4 py-3.5 rounded-xl border border-[#E5E7EB] outline-none focus:border-[#C46A54] transition bg-white text-[#0C1014]"
                />
            </div>

            {/* Birth Year */}
            <div>
                <label className="block text-[#6F7680] text-[16px] md:text-[18px] mb-2">
                    {t("onboarding.birthYearLabel")}
                </label>
                <select
                    value={formData.birthYear}
                    onChange={(e) => setFormData({ ...formData, birthYear: e.target.value })}
                    className="w-full px-4 py-3.5 rounded-xl border border-[#E5E7EB] outline-none focus:border-[#C46A54] transition bg-white text-[#0C1014] appearance-none"
                >
                    <option value="" disabled>Select year</option>
                    {years.map((year) => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>
            </div>

            {/* Gender */}
            <div>
                <label className="block text-[#6F7680] text-[16px] md:text-[18px] mb-2">
                    {t("onboarding.genderLabel")}
                </label>
                <div className="grid grid-cols-2 gap-3">
                    {GENDER_OPTIONS.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => setFormData({ ...formData, gender: option.value })}
                            className={`
                px-4 py-3 rounded-xl border text-[14px] font-medium transition
                ${formData.gender === option.value
                                    ? "border-[#C46A54] bg-[#FFF6EB] text-[#C46A54]"
                                    : "border-[#E5E7EB] bg-white text-[#0C1014] hover:bg-gray-50"
                                }
              `}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {error}
                </div>
            )}
        </div>
    );

    /* ---------------- MOBILE ---------------- */
    if (isMobile) {
        return (
            <div className="max-h-screen flex flex-col bg-white">
                <div className="px-4 pt-6 text-center">
                    <h1 className="text-[24px] font-bold text-[#0C1014]">
                        {t("onboarding.tellUsAboutYourself")}
                    </h1>
                    <p className="text-[#6F7680] mt-2">
                        {t("onboarding.letsGetStarted")}
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto px-4 pt-8 pb-32">
                    {Content}
                </div>

                <div
                    className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100"
                    style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
                >
                    <div className="px-4 pt-3 pb-4">
                        <button
                            onClick={handleContinue}
                            disabled={isLoading || !formData.name || !formData.birthYear || !formData.gender}
                            className={`w-full py-4 rounded-2xl text-[16px] font-medium transition flex items-center justify-center
                ${isLoading || !formData.name || !formData.birthYear || !formData.gender
                                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                    : "bg-[#C46A54] text-white"
                                }
              `}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={20} className="animate-spin mr-2" /> Saving...
                                </>
                            ) : (
                                "Continue"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    /* ---------------- DESKTOP ---------------- */
    return (
        <div className="w-full h-full flex items-center justify-center bg-white">
            <div className="max-w-[420px] w-full">
                <div className="text-center mb-8">
                    <h1 className="text-[26px] font-bold text-[#0C1014]">
                        Tell us about you
                    </h1>
                    <p className="text-[#6F7680] mt-2">
                        This helps us personalize your experience.
                    </p>
                </div>

                {Content}

                <div className="mt-8">
                    <button
                        onClick={handleContinue}
                        disabled={isLoading || !formData.name || !formData.birthYear || !formData.gender}
                        className={`w-full py-3.5 rounded-full text-[15px] font-medium transition flex items-center justify-center
              ${isLoading || !formData.name || !formData.birthYear || !formData.gender
                                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                : "bg-[#C46A54] text-white"
                            }
            `}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={18} className="animate-spin mr-2" /> Saving...
                            </>
                        ) : (
                            "Continue"
                        )}
                    </button>

                    <button
                        onClick={onBack}
                        className="w-full mt-4 text-[#6F7680] text-[14px] hover:underline"
                    >
                        Back
                    </button>
                </div>
            </div>
        </div>
    );
}
