"use client";

import { useState, useEffect } from "react";
import { X, Sparkles, Copy, Check, RefreshCw } from "lucide-react";
import emailService from "@/services/email";

interface AISummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  emailId: string;
  title: string;
  existingSummary?: string | null;
}

export default function AISummaryModal({
  isOpen,
  onClose,
  emailId,
  title,
  existingSummary,
}: AISummaryModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50" 
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[540px] z-50">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">AI Summary</h3>
                <p className="text-xs text-gray-500">Powered by AI</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Title */}
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
            <p className="text-sm text-gray-600 line-clamp-2">{title}</p>
          </div>

          {/* Content - Coming Soon */}
          <div className="px-6 py-12 flex flex-col items-center justify-center text-center">
            {/* Animated Illustration */}
            <div className="relative mb-8">
              {/* Laptop Base */}
              <div className="relative">
                <svg width="200" height="140" viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Laptop Screen */}
                  <rect x="30" y="10" width="140" height="90" rx="4" fill="#1F2937" stroke="#374151" strokeWidth="2"/>
                  
                  {/* Screen Content - Code Lines with animation */}
                  <rect x="40" y="20" width="50" height="3" rx="1.5" fill="#10B981" className="animate-pulse" style={{ animationDelay: '0s' }}/>
                  <rect x="40" y="28" width="70" height="3" rx="1.5" fill="#60A5FA" className="animate-pulse" style={{ animationDelay: '0.2s' }}/>
                  <rect x="40" y="36" width="40" height="3" rx="1.5" fill="#F59E0B" className="animate-pulse" style={{ animationDelay: '0.4s' }}/>
                  <rect x="40" y="44" width="80" height="3" rx="1.5" fill="#8B5CF6" className="animate-pulse" style={{ animationDelay: '0.6s' }}/>
                  <rect x="40" y="52" width="60" height="3" rx="1.5" fill="#EC4899" className="animate-pulse" style={{ animationDelay: '0.8s' }}/>
                  <rect x="40" y="60" width="55" height="3" rx="1.5" fill="#10B981" className="animate-pulse" style={{ animationDelay: '1s' }}/>
                  <rect x="40" y="68" width="75" height="3" rx="1.5" fill="#60A5FA" className="animate-pulse" style={{ animationDelay: '1.2s' }}/>
                  <rect x="40" y="76" width="45" height="3" rx="1.5" fill="#F59E0B" className="animate-pulse" style={{ animationDelay: '1.4s' }}/>
                  
                  {/* Laptop Base */}
                  <path d="M10 100 L20 110 L180 110 L190 100 Z" fill="#374151"/>
                  <rect x="20" y="100" width="160" height="10" fill="#4B5563"/>
                  
                  {/* Keyboard hint */}
                  <circle cx="100" cy="105" r="2" fill="#9CA3AF"/>
                </svg>
                
                {/* Floating Sparkles */}
                <Sparkles size={20} className="text-purple-500 absolute -top-2 -right-2 animate-bounce" style={{ animationDelay: '0s' }}/>
                <Sparkles size={16} className="text-pink-500 absolute top-4 -left-4 animate-bounce" style={{ animationDelay: '0.5s' }}/>
                <Sparkles size={18} className="text-blue-500 absolute -bottom-2 right-8 animate-bounce" style={{ animationDelay: '1s' }}/>
              </div>
            </div>

            {/* Coming Soon Text */}
            <div className="space-y-3 mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                AI Summary Coming Soon! 🚀
              </h3>
              <p className="text-gray-600 max-w-sm mx-auto leading-relaxed">
                Our team is working hard to bring you intelligent AI-powered summaries. 
                Stay tuned for this exciting feature!
              </p>
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 animate-pulse"></span>
                <span className="w-2 h-2 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-2 h-2 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 animate-pulse" style={{ animationDelay: '0.4s' }}></span>
              </div>
              <span className="font-medium">In Development</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
