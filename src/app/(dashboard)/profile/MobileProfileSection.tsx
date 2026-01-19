"use client";

import Image from "next/image";
import { ArrowLeft, ChevronRight, Pencil, BarChart3 } from "lucide-react";
import { getInitials } from "./page";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { UserProfileResponse } from "@/services/user";
import { useAuth } from "@/contexts/AuthContext";
import EditProfileModal from "@/components/profile/EditProfileModal";
import ThemeBottomSheet from "@/components/profile/ThemeBottomSheet";

/* ---------------------------------------
   Progress Ring
---------------------------------------- */
function ProgressRing({ percent }: { percent: number }) {
  const size = 65;
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(90deg)" }}>
        <circle
          stroke="#C9E9D2"
          fill="transparent"
          strokeWidth={stroke}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          stroke="#2E6F40"
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
    </div>
  );
}

/* ---------------------------------------
   Toggle Component (iOS style)
---------------------------------------- */
function MobileToggle({
  isOn,
  onToggle,
}: {
  isOn: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`w-[46px] h-[26px] rounded-full relative transition-colors 
      ${isOn ? "bg-[#C46A54]" : "bg-[#D0D4DB]"}`}
    >
      <span
        className={`absolute top-[3px] w-[20px] h-[20px] bg-white rounded-full transition-all
        ${isOn ? "left-[22px]" : "left-[3px]"}`}
      />
    </button>
  );
}

/* ---------------------------------------
   MAIN MOBILE PROFILE
---------------------------------------- */
export default function MobileProfileSection({
  activePage,
  setActivePage,
  user,
  appearance,
  setAppearance,
  copyToClipboard,
  loadingProfile,
  profileError,
  profile,
  onSave,
}: {
  activePage: any;
  setActivePage: (v: any) => void;
  user: any;
  appearance: "light" | "dark" | "system";
  setAppearance: (v: "light" | "dark" | "system") => void;
  copyToClipboard: () => void;
  loadingProfile: boolean;
  profileError: string | null;
  profile: UserProfileResponse | null;
  onSave: (data: { name?: string; birthYear?: string; gender?: string }) => Promise<void>;
  onEdit?: () => void;
}) {
  const router = useRouter();
  const { logout } = useAuth();
  const { t } = useTranslation("common");
  const [notifications, setNotifications] = useState(true);
  const [haptics, setHaptics] = useState(true);

  // ⭐ Added for modal
  const [showEditModal, setShowEditModal] = useState(false);

  // ⭐ Added for theme bottom sheet
  const [themeSheetOpen, setThemeSheetOpen] = useState(false);
  const [themeMode, setThemeMode] = useState<
    "light" | "dark" | "system"
  >(appearance || "system");

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F6FA]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black" />
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F6FA] p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-center">
          {profileError}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F6FA] pb-20">
      {/* HEADER */}
      <div className="flex items-center h-[56px] px-4 border-[#EAECF0]">
        <ArrowLeft
          size={22}
          onClick={() => router.push("/inbox")}
          className="mr-3"
        />
        <p className="text-[20px] font-semibold flex-1 text-center mr-6">
          {t("mobile.profile")}
        </p>
        <BarChart3
          size={22}
          onClick={() => router.push("/analytics")}
          className="mr-3"
        />
      </div>

      {/* TOP PROFILE */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <ProgressRing percent={user?.completeness || 0} />
            <div className="absolute inset-0 flex items-center justify-center text-[14px] font-bold">
              {getInitials(user.name)}
            </div>
          </div>

          <div>
            <p className="text-[18px] font-semibold">{user.name}</p>
            <p className="text-[14px] text-[#6F7680]">
                {user.joined ? `${t("mobile.joined")} ${user.joined}` : ""}
            </p>
          </div>
        </div>

        {/* Edit Icon → OPEN MODAL */}
        <button
          onClick={() => setShowEditModal(true)}
          className="p-2 active:scale-90"
        >
          <Pencil size={20} strokeWidth={1.8} className="text-[#0C1014]" />
        </button>
      </div>

      {/* HIGHLIGHTS / READ LATER */}
      <div className="px-4 flex gap-3">
        {/* HIGHLIGHTS */}
        <div
          onClick={() => router.push("/highlights")}
          className="flex-1 bg-white shadow rounded-xl p-4 active:scale-95 transition cursor-pointer"
        >
          <Image
            src="/icons/highlight-icon.png"
            width={26}
            height={26}
            alt=""
          />
          <p className="text-[14px] mt-2 font-medium">{t("mobile.highlights")}</p>
          <p className="text-[12px] text-[#6F7680] mt-1">22 {t("mobile.reads")}</p>
        </div>

        {/* READ LATER */}
        <div
          onClick={() => router.push("/read_later")}
          className="flex-1 bg-white shadow rounded-xl p-4 active:scale-95 transition cursor-pointer"
        >
          <Image
            src="/icons/read-later-icon.png"
            width={26}
            height={26}
            alt=""
          />
          <p className="text-[14px] mt-2 font-medium">{t("nav.readLater")}</p>
          <p className="text-[12px] text-[#6F7680] mt-1">1 {t("mobile.reads")}</p>
        </div>
      </div>

      {/* INBO MAIL */}
      <div className="mx-4 mt-5 bg-white rounded-2xl p-4 shadow-sm border border-[#ECECEC]">
        <p className="text-[16px] font-semibold mb-3">{t("mobile.yourInboMail")}</p>

        <div className="flex items-center justify-between">
          <div className="flex gap-3">
            <Image
              src="/logos/help-inbo-logo.png"
              width={40}
              height={40}
              alt=""
            />
            <div>
              <p className="text-[13px] text-[#6F7680]">{t("mobile.inboMailbox")}</p>
              <p className="text-[15px] font-semibold">
                {user.inboxEmail || "Not created"}
              </p>
            </div>
          </div>

          <button
            onClick={copyToClipboard}
            className="rounded-full px-3 py-1.5 bg-white border border-[#D8DDE3] text-[13px]"
          >
            {t("mobile.copy")}
          </button>
        </div>

        <p className="text-[12px] text-[#6F7680] mt-3 leading-[16px]">
          Use this email when subscribing to newsletters. All your
          newsletters arrive here.
        </p>
      </div>

      {/* MANAGE SECTION */}
      <MobileList
        title={t("mobile.manage")}
        items={[
          [t("mobile.offlineNewsletters"), "/offline"],
          [t("mobile.manageSubscriptions"), "/subscriptions"],
          [t("nav.favorites"), "/favorite"],
          [t("mobile.collection"), "/collection"],
          [t("mobile.trash"), "/delete"],
        ]}
        router={router}
        setActivePage={setActivePage}
      />

      {/* GENERAL SETTINGS */}
      <div className="mx-4 mt-6">
        <p className="text-[16px] font-semibold mb-3">
          {t("mobile.generalSettings")}
        </p>

        <MobileRow
          label={t("mobile.accountSettings")}
          onPress={() => setActivePage("account")}
        />

        {/* ⭐ UPDATED: Appearance opens theme bottom sheet */}
        <MobileRow
          label={t("mobile.appearance")}
          value={themeMode}
          onPress={() => setThemeSheetOpen(true)}
        />

        <MobileRow
          label={t("mobile.customizeSwipes")}
          onPress={() => setActivePage("swipes")}
        />

        <MobileRow
          label={t("mobile.notification")}
          toggle={
            <MobileToggle
              isOn={notifications}
              onToggle={() => setNotifications(!notifications)}
            />
          }
        />

        <MobileRow
          label={t("mobile.hapticFeedback")}
          toggle={
            <MobileToggle
              isOn={haptics}
              onToggle={() => setHaptics(!haptics)}
            />
          }
        />
      </div>

      {/* HELP & ABOUT */}
      <MobileList
        title={t("mobile.helpAndAbout")}
        items={[
          [t("mobile.helpAndFaq"), "help"],
          [t("mobile.shareFeedback"), "feedback"],
          [t("mobile.reportBug"), "bug"],
          [t("mobile.aboutUs"), "about"],
        ]}
        router={router}
        setActivePage={setActivePage}
      />

      {/* LOGOUT */}
      <div 
        onClick={handleLogout}
        className="mx-4 mt-4 bg-white rounded-xl border shadow-sm p-4 flex justify-between items-center cursor-pointer hover:bg-red-50"
      >
        <p className="text-[15px] text-red-500 font-medium">{t("auth.logout")}</p>
        <ChevronRight size={20} className="text-red-500" />
      </div>

      {/* FOOTER */}
      <div className="flex flex-col items-center mt-8 opacity-60">
        <Image
          src="/logos/inbo-logo.png"
          width={50}
          height={50}
          alt="inbo"
        />
        <p className="text-[12px] mt-1">v2.00(0)</p>
      </div>

      {/* ⭐ EDIT PROFILE MODAL */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        profile={profile}
        onSave={onSave}
      />

      {/* ⭐ THEME BOTTOM SHEET */}
      <ThemeBottomSheet
        isOpen={themeSheetOpen}
        value={themeMode}
        onClose={() => setThemeSheetOpen(false)}
        onChange={(mode) => {
          setThemeMode(mode);
          setAppearance(mode);
        }}
      />
    </div>
  );
}

/* ---------------------------------------
   Mobile Row Component
---------------------------------------- */
function MobileRow({
  label,
  value,
  onPress,
  toggle,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
  toggle?: React.ReactNode;
}) {
  return (
    <div
      onClick={onPress}
      className="bg-white p-4 rounded-xl border shadow-sm mb-3 flex justify-between items-center active:bg-gray-50"
    >
      <p className="text-[15px] text-[#0C1014]">{label}</p>

      {toggle ? (
        toggle
      ) : (
        <div className="flex items-center gap-2">
          {value && (
            <span className="text-[14px] text-[#6F7680] capitalize">
              {value}
            </span>
          )}
          <ChevronRight size={18} className="opacity-60" />
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------
   Section List Component
---------------------------------------- */
function MobileList({ title, items, router, setActivePage }: any) {
  return (
    <div className="mx-4 mt-6">
      <p className="text-[16px] font-semibold mb-3">{title}</p>

      {items.map(([label, key]: any) => (
        <div
          key={key}
          onClick={() => {
            if (key.startsWith("/")) router.push(key);
            else setActivePage(key);
          }}
        >
          <MobileRow label={label} />
        </div>
      ))}
    </div>
  );
}
