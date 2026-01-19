"use client";

import { Star } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function EmptyFavourite() {
  const { t } = useTranslation("common");
  return (
    <div className="flex items-center justify-center px-6">
      <div className="flex flex-col items-center text-center">

        {/* Title */}
        <h3 className="text-[22px] font-semibold text-[#0C1014] mb-3">
          {t("favorites.empty")}
        </h3>

        {/* Description */}
        <p className="text-[18px] text-[#6F7680] leading-[26px] max-w-[340px]">
          {t("favorites.emptyDescription")}
        </p>
      </div>
    </div>
  );
}
