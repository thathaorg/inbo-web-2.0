"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Copy, Check, X, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface EmailCopyBoxProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function EmailCopyBox({ isVisible, onClose }: EmailCopyBoxProps) {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Ensure component is mounted (client-side only)
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Get user's Inbo email - check multiple possible fields
  const inboEmail = user?.inboxEmail || user?.email || "";
  
  // Debug log
  useEffect(() => {
    if (isVisible) {
      console.log('📧 EmailCopyBox visible, user:', user, 'inboEmail:', inboEmail);
    }
  }, [isVisible, user, inboEmail]);

  const handleCopy = async () => {
    if (!inboEmail) return;
    
    try {
      await navigator.clipboard.writeText(inboEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy email:", err);
    }
  };

  // Auto-hide after 30 seconds
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  // Don't render on server or if not visible
  if (!mounted || !isVisible) return null;
  
  // Show even without email (with placeholder)
  const displayEmail = inboEmail || "Loading...";

  const content = (
    <div 
      className="fixed right-6 top-1/2 -translate-y-1/2 z-[999999] animate-in slide-in-from-right-4 duration-300"
      style={{ pointerEvents: 'auto' }}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 min-w-[320px] max-w-[400px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#C46A54] flex items-center justify-center">
              <Mail className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700">Your Inbo Email</span>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Email Display */}
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
          <input
            type="text"
            value={displayEmail}
            readOnly
            className="flex-1 bg-transparent text-[15px] font-medium text-gray-800 outline-none select-all cursor-text"
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <button
            onClick={handleCopy}
            disabled={!inboEmail}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-lg
              text-sm font-medium transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              ${copied 
                ? "bg-green-100 text-green-700" 
                : "bg-[#0C1014] text-white hover:bg-gray-800"
              }
            `}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Help Text */}
        <p className="text-xs text-gray-500 mt-2 text-center">
          Paste this email in the newsletter subscription form
        </p>
      </div>
    </div>
  );

  // Use portal to render at body level
  return createPortal(content, document.body);
}
