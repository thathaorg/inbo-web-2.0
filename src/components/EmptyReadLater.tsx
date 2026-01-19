"use client";

import { useTranslation } from "react-i18next";

export default function EmptyReadLater() {
  const { t } = useTranslation("common");
  return (
    <div className="flex items-center justify-center px-6">
      <div className="flex flex-col items-center text-center">
        {/* Decorative dot */}
        <div className="w-16 h-16 rounded-full bg-[#C46A54] mb-6" />

        {/* Title */}
        <h3 className="text-[22px] font-semibold text-[#0C1014] mb-3">
          {t("readLater.empty")}
        </h3>

        {/* Description */}
        <p className="text-[18px] text-[#6F7680] leading-[26px] max-w-[320px]">
          {t("readLater.emptyDescription")}
        </p>
      </div>
    </div>
  );
}
