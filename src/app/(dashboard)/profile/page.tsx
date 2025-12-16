"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronRight } from "lucide-react";

// Sub Pages
import AccountPage from "@/components/profile/AccountPage";
import HelpCenterPage from "@/components/profile/HelpCenterPage";
import FeedbackPage from "@/components/profile/FeedbackPage";
import BugReportPage from "@/components/profile/BugReportPage";
import DeactivatePage from "@/components/profile/DeactivatePage";
import PrivacySecurityPage from "@/components/profile/PrivacySecurityPage";
import ContactSupportPage from "@/components/profile/ContactSupportPage";
import AboutPage from "@/components/profile/AboutPage";
import EditProfileModal from "@/components/profile/EditProfileModal";
import ProfileHeader from "@/components/profile/Header";

/* ---------------------------------------
   Utility: Get Initials
---------------------------------------- */
const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

/* ---------------------------------------
   Progress Ring Component
---------------------------------------- */
function ProgressRing({
  size = 65,
  stroke = 6,
  percent = 72,
  children,
}: {
  size?: number;
  stroke?: number;
  percent?: number;
  children: React.ReactNode;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
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

      {/* Initials */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-black font-bold text-[14px] leading-[24px] ">
          {children}
        </span>
      </div>

      {/* Percentage pill */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#2E6F40] text-white text-[10px] 
                      font-normal px-2 py-[3px] rounded-[12px] tracking-[0.4px]">
        {percent}%
      </div>
    </div>
  );
}

/* ---------------------------------------
   QR Badge Component
---------------------------------------- */
function QRBadge({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center">

      {/* MAIN CONTAINER */}
      <div className="relative w-[140px] h-[160px] flex items-start justify-center">

        {/* Envelope */}
        <Image
          src="/badges/profile-inbo-vector.png"
          alt="envelope"
          fill
          className="object-contain"
        />

        {/* QR overlay */}
        <Image
          src="/badges/profile-inbo-qr.png"
          alt="qr"
          width={72}
          height={72}
          className="absolute top-[12px] left-1/2 -translate-x-1/2"
        />

        {/* LABEL INSIDE VECTOR AT THE BOTTOM */}
        <p className="absolute bottom-[6px] left-1/2 -translate-x-1/2 text-[#C46A54] text-[12px] font-medium leading-[16px] font">
          {label}
        </p>
      </div>

    </div>
  );
}


/* ---------------------------------------
   MAIN COMPONENT
---------------------------------------- */
export default function ProfileSection() {
  const [appearance, setAppearance] =
    useState<"light" | "dark" | "system">("system");

  const copyToClipboard = () => {
    navigator.clipboard.writeText("example@inbo.club");
  };

  const [activePage, setActivePage] = useState<
    | "main"
    | "account"
    | "help"
    | "support"
    | "privacy"
    | "feedback"
    | "bug"
    | "about"
    | "deactivate"
  >("main");

  const [showEditModal, setShowEditModal] = useState(false);

  const user = {
    name: "Sarah Mitchell",
    email: "example@email.com",
    joined: "August 17, 2025",
    completeness: 72,
  };

  /* ---------------------------------------
     SUBPAGE ROUTER
  ---------------------------------------- */
  if (activePage !== "main") {
    const pages: any = {
      account: AccountPage,
      help: HelpCenterPage,
      support: ContactSupportPage,
      privacy: PrivacySecurityPage,
      feedback: FeedbackPage,
      bug: BugReportPage,
      about: AboutPage,
      deactivate: DeactivatePage,
    };

    const Page = pages[activePage];
    return (
      <div className="flex flex-col w-full">
        <ProfileHeader title="Profile Overview" />
        <Page onBack={() => setActivePage("main")} />
      </div>
    );
  }

  /* ---------------------------------------
     MAIN PAGE
  ---------------------------------------- */
  return (
    <div className="flex flex-col w-full">

      {/* HEADER */}
      <ProfileHeader title="Profile" />

      {/* CONTENT */}
      <div className="px-6 py-8 flex flex-col gap-6">

        {/* -------------------------------------------
            PROFILE CARD
        ------------------------------------------- */}
        <div className="bg-white rounded-[20px] shadow-[0px_4px_24px_rgba(219,219,219,0.25)]
                        p-6 border border-[#EDEDED] flex flex-col gap-6">

          <div className="flex justify-between items-center">

            <div className="flex items-center gap-3">
              <ProgressRing percent={user.completeness}>
                {getInitials(user.name)}
              </ProgressRing>

              <div className="flex flex-col gap-[6px]">
                <p className="text-[18px] font-medium leading-[24px] text-[#0C1014] font">
                  {user.name}
                </p>
                <p className="text-[16px] leading-[20px] text-[#6F7680] font">
                  Joined {user.joined}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowEditModal(true)}
              className="px-4 py-2 rounded-full border border-[#DBDFE4] text-[#0C1014]
                         text-[14px] font-semibold hover:bg-gray-50"
            >
              Edit
            </button>
          </div>

          <div className="flex flex-col gap-[6px]">
            <p className="text-[16px] font-medium text-[#0C1014] font">Email</p>
            <p className="text-[14px] text-[#6F7680] font">{user.email}</p>
          </div>
        </div>

        {/* -------------------------------------------
            INBO MAIL
        ------------------------------------------- */}
        <div className="relative bg-white rounded-[20px] shadow-[0px_4px_124px_rgba(219,219,219,0.25)] p-5 overflow-hidden">

          <Image
            src="/badges/profile-inbo-email-bg.png"
            alt="bg"
            fill
            className="object-cover opacity-90 rounded-2xl pointer-events-none z-0"
          />

          <div className="relative z-10">
            <p className="text-[20px] font-medium leading-[30px] text-[#0C1014] mb-3 font">
              Your Inbo mail
            </p>

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-3">
                <img src="/logos/help-inbo-logo.png" alt="" className="w-[42px] h-[42px]" />

                <div className="flex flex-col gap-[6px]">
                  <p className="text-[16px] text-[#6F7680] font-normal font">
                    Inbo Mailbox
                  </p>
                  <p className="text-[18px] font-medium text-[#0C1014] font">
                    example@inbo.club
                  </p>
                </div>
              </div>

              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border
                           border-[#DBDFE4] text-[#0C1014] text-[14px] font-medium hover:bg-gray-50"
              >
                <img src="/icons/copy-icon.png" alt="" className="w-4 h-4" />
                Copy Address
              </button>
            </div>

            <div className="border-t border-[#DBDFE4] mt-4 pt-4">
              <p className="text-[14px] leading-[16px] text-[#0C1014] font-medium font">
                Use this email address when subscribing to newsletters. All newsletters sent to this
                address will appear here in Inbo.
              </p>
            </div>
          </div>
        </div>

        {/* -------------------------------------------
            MOBILE APP (FINAL MATCH)
        ------------------------------------------- */}
        <div className="bg-white rounded-[20px] border border-[#EDEDED] px-5 pt-5 shadow-sm">

          <div className="flex w-full">

            {/* LEFT TEXT SECTION */}
            <div className="flex flex-col w-[40%] mt-3">
              <p className="text-[#C46A54] text-[20px] font-semibold mb-3">
                MOBILE APP
              </p>

              <h2 className="text-[#0C1014] text-[32px] font-bold leading-[36px]">
                Scan QR to download our<br />INBO Application
              </h2>
            </div>

            {/* RIGHT IMAGE + QR SECTION */}
            <div className="flex flex-row w-[60%] justify-between items-center">

              {/* PHONE IMAGE — LEFT END */}
              <Image
                src="/badges/profile-inbo-mobile-app.png"
                alt="Mobile App"
                width={320}
                height={300}
                className="object-contain"
              />

              {/* QR BADGES — RIGHT END */}
              <div className="flex flex-row space-x-10">
                <QRBadge label="For iOS" />
                <QRBadge label="For Android" />
              </div>

            </div>

          </div>
        </div>

        {/* -------------------------------------------
                APPEARANCE
        ------------------------------------------- */}
        <div className="bg-white rounded-2xl shadow-md border border-[#EDEDED] p-6">
          <p className="font-semibold text-gray-900 text-[20px] mb-4">
            Appearance
          </p>

          <div className="flex gap-6">
            {[
              { mode: "light", img: "/badges/profile-light-theme.png" },
              { mode: "dark", img: "/badges/profile-dark-theme.png" },
              { mode: "system", img: "/badges/profile-system-theme.png" },
            ].map(({ mode, img }) => (
              <button
                key={mode}
                onClick={() => setAppearance(mode as any)}
                className="flex flex-col items-center gap-2 p-3 hover:bg-gray-50"
              >
                {/* IMAGE WRAPPER WITH CONDITIONAL BORDER */}
                <div
                  className={`rounded-3xl border-4
                    ${
                      appearance === mode
                        ? "border-black shadow-md"
                        : "border-transparent"
                    }`}
                >
                  <Image src={img} width={110} height={70} alt={mode} className="block"/>
                </div>

                {/* LABEL */}
                <span className="text-sm capitalize">{mode}</span>
              </button>
            ))}
          </div>
        </div>


        {/* -------------------------------------------
            GMAIL CONNECTION
        ------------------------------------------- */}
        <div
          className="bg-white rounded-2xl shadow-md border border-[#EDEDED] p-6"
        >
          {/* Gmail Connection */}
          <p
            style={{
              color: 'var(--Text-heading, #0C1014)',
              fontSize: 20,
              fontWeight: 500,
              lineHeight: '30px',
              wordWrap: 'break-word'
            }}
            className="mb-4"
          >
            Gmail Connection
          </p>

          <div className="flex items-center gap-3">
            <Image src="/icons/gmail-icon.png" width={48} height={48} alt="gmail" />

            <div>
              {/* Gmail (Primary) */}
              <p
                style={{
                  color: 'var(--Text-body, #6F7680)',
                  fontSize: 16,
                  fontWeight: 400,
                  lineHeight: '20px',
                  wordWrap: 'break-word'
                }}
              >
                Gmail (Primary)
              </p>

              {/* example@inbo.club */}
              <p
                style={{
                  color: 'var(--Text-heading, #0C1014)',
                  fontSize: 18,
                  fontWeight: 500,
                  lineHeight: '24px',
                  wordWrap: 'break-word'
                }}
              >
                example@inbo.club
              </p>
            </div>
          </div>
        </div>

        {/* -------------------------------------------
            INTEGRATION
        ------------------------------------------- */}
        <div className="bg-white rounded-2xl shadow-md border border-[#EDEDED] p-6">
          {/* Heading: Integration */}
          <p
            style={{
              color: 'var(--Text-heading, #0C1014)',
              fontSize: 20,
              fontWeight: 500,
              lineHeight: '30px',
              wordWrap: 'break-word'
            }}
            className="mb-4"
          >
            Integration
          </p>

          {/* No Integration Apps Found */}
          <div className="flex items-center gap-2 mb-6">
            <img
              src="/icons/about-icon.png"
              alt="info"
              width={20}
              height={20}
              className="opacity-70"
            />
            <p
              style={{
                color: 'var(--Text-body, #6F7680)',
                fontSize: 16,
                fontWeight: 400,
                lineHeight: '20px',
                wordWrap: 'break-word'
              }}
            >
              No Integration Apps Found
            </p>
          </div>

          {/* Add apps button */}
          <button
            style={{
              color: 'var(--Text-on-action, #FFFFFF)',
              fontSize: 16,
              fontWeight: 500,
              lineHeight: '20px',
              wordWrap: 'break-word'
            }}
            className="px-6 py-2 rounded-full bg-[#D25F3F] hover:bg-[#C85737] shadow-sm transition"
          >
            + Add apps
          </button>
        </div>


        {/* -------------------------------------------
            SETTINGS
        ------------------------------------------- */}
        <div className="bg-white rounded-2xl shadow-md border border-[#EDEDED] p-6">
          <p className="font-semibold text-gray-900 text-[20px] mb-4">Setting and Helps</p>

          {[
            { label: "Account", key: "account", icon: "/icons/account-icon.png" },
            { label: "Help Center", key: "help", icon: "/icons/help-center-icon.png" },
            { label: "Contact Support", key: "support", icon: "/icons/contact-support-icon.png" },
            { label: "Privacy & Security Info", key: "privacy", icon: "/icons/account-icon.png" },
            { label: "Send Feedback", key: "feedback", icon: "/icons/feedback-icon.png" },
            { label: "Report a Bug", key: "bug", icon: "/icons/feedback-bug-icon.png" },
            { label: "About", key: "about", icon: "/icons/about-icon.png" },
          ].map(({ label, key, icon }) => (
            <div
              key={key}
              onClick={() => setActivePage(key as any)}
              className="w-full bg-white rounded-xl shadow-[0px_4px_24px_rgba(219,219,219,0.25)]
                         border border-[#EEEFF2] px-4 py-3 flex items-center justify-between
                         mb-3 cursor-pointer hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <Image src={icon} width={22} height={22} alt={label} />
                <span className="text-[#0C1014] text-[16px]">{label}</span>
              </div>
              <ChevronRight className="text-black opacity-80" size={20} />
            </div>
          ))}

          <button className="mt-6 w-full text-red-500 border border-red-300 py-2 rounded-lg bg-[#FFF5F5] hover:bg-[#ffecec]">
            Logout
          </button>
        </div>
      </div>

      <EditProfileModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} />
    </div>
  );
}
