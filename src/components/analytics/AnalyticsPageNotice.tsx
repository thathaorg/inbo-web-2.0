import React from "react";

export default function AnalyticsPageNotice() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "1.5rem",
        background: "#FFF8E1",
        borderRadius: "1.5rem",
        padding: "1.25rem 2rem",
        boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
        marginBottom: "2rem",
        position: "relative",
        zIndex: 10,
      }}
    >
      {/* Logo illustration: engineer coding */}
      <img
        src="/icons/engineer-coding-funny.svg"
        alt="Funny engineer coding hard on laptop in stress"
        style={{ width: "64px", height: "64px", objectFit: "contain" }}
      />
      <div>
        <div style={{ fontWeight: 700, fontSize: "1.25rem", color: "#C46A54" }}>
          🛠️ Analytics page is still cooking!
        </div>
        <div style={{ fontSize: "1rem", color: "#6F7680", marginTop: "0.25rem" }}>
          Our engineer is coding hard (and maybe a little stressed 😅). Some features are still on the way!
        </div>
      </div>
    </div>
  );
}
