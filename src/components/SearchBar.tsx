"use client";

import { Search, X, Mail, Globe, Clock, ArrowRight } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import searchService, { SearchResults } from "@/services/search";
import Image from "next/image";

export default function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation("common");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Determine search context based on current page
  const getSearchContext = useCallback((): "inbox" | "discover" | "all" => {
    if (pathname.startsWith("/inbox")) return "inbox";
    if (pathname.startsWith("/discover")) return "discover";
    return "all";
  }, [pathname]);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved).slice(0, 5));
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  // Save search to recent
  const saveRecentSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;

    const updated = [trimmed, ...recentSearches.filter((s) => s !== trimmed)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  // Sync input from URL when on /search page
  useEffect(() => {
    if (pathname === "/search") {
      const params = new URLSearchParams(window.location.search);
      const urlQuery = params.get("q") ?? "";
      setQuery(urlQuery);
      if (urlQuery) setIsExpanded(true);
    }
  }, [pathname]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        if (!query.trim()) {
          setIsExpanded(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [query]);

  // Perform search with debouncing
  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setSearchResults(null);
        return;
      }

      setIsSearching(true);
      try {
        const context = getSearchContext();
        console.log("🔎 Performing search:", searchQuery, "context:", context);
        const results = await searchService.quickSearch(searchQuery, context);
        console.log("📋 Search results:", results);
        setSearchResults(results);
      } catch (error) {
        console.error("Search failed:", error);
        setSearchResults(null);
      } finally {
        setIsSearching(false);
      }
    },
    [getSearchContext]
  );

  // Handle input change with debounce
  const handleChange = (value: string) => {
    setQuery(value);
    setShowDropdown(true);

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce search (200ms for responsiveness)
    debounceRef.current = setTimeout(() => {
      performSearch(value);
    }, 200);
  };

  // Handle search submission
  const handleSubmit = (searchQuery?: string) => {
    const trimmed = (searchQuery || query).trim();
    if (!trimmed) return;

    setShowDropdown(false);
    saveRecentSearch(trimmed);
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  // Handle email result click
  const handleEmailClick = (id: string) => {
    setShowDropdown(false);
    saveRecentSearch(query);
    router.push(`/reading/${id}`);
  };

  // Handle newsletter result click
  const handleNewsletterClick = (id: string) => {
    setShowDropdown(false);
    saveRecentSearch(query);
    router.push(`/discover?newsletter=${id}`);
  };

  // Handle recent search click
  const handleRecentClick = (term: string) => {
    setQuery(term);
    handleSubmit(term);
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  // Handle clear input
  const handleClear = () => {
    setQuery("");
    setSearchResults(null);
    inputRef.current?.focus();
  };

  // Handle focus
  const handleFocus = () => {
    setIsExpanded(true);
    setShowDropdown(true);
  };

  const context = getSearchContext();
  const hasResults =
    searchResults && (searchResults.emails.length > 0 || searchResults.newsletters.length > 0);
  const showRecentSearches = !query.trim() && recentSearches.length > 0;

  return (
    <div ref={containerRef} className="relative w-full md:w-auto">
      {/* Search Input Container */}
      <div
        className={`
          flex items-center bg-white
          h-11
          border border-[#DBDFE4]
          pl-4 pr-2
          transition-all duration-200 ease-out
          ${
            showDropdown && isExpanded
              ? "w-full md:w-[480px] rounded-t-[22px] shadow-md border-b-transparent"
              : "w-full md:w-[380px] rounded-full shadow-sm hover:shadow-md"
          }
        `}
      >
        <Search size={18} className="text-gray-400 mr-3 flex-shrink-0" />

        <input
          ref={inputRef}
          type="text"
          placeholder={
            context === "inbox"
              ? "Search your emails..."
              : context === "discover"
              ? "Search newsletters..."
              : "Search emails & newsletters..."
          }
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={handleFocus}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSubmit();
            } else if (e.key === "Escape") {
              setShowDropdown(false);
              inputRef.current?.blur();
            }
          }}
          className="flex-1 bg-transparent outline-none text-[15px] text-gray-900 placeholder:text-gray-500"
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors mr-1"
          >
            <X size={18} className="text-gray-500" />
          </button>
        )}

        <div className="h-6 w-px bg-gray-200 mx-1" />

        <button
          type="button"
          onClick={() => handleSubmit()}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <Search size={18} className="text-[#C4704F]" />
        </button>
      </div>

      {/* Dropdown - Google Style */}
      {showDropdown && isExpanded && (
        <div
          className="absolute left-0 right-0 bg-white border border-t-0 border-[#DBDFE4] rounded-b-[22px] shadow-md z-50 overflow-hidden"
          style={{
            top: "44px",
            width: "100%",
            maxWidth: "480px",
          }}
        >
          {/* Divider line */}
          <div className="mx-4 border-t border-gray-200" />

          {/* Loading State */}
          {isSearching && query.trim() && (
            <div className="flex items-center gap-3 px-5 py-3">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
              <span className="text-sm text-gray-600">Searching...</span>
            </div>
          )}

          {/* Recent Searches - Show when no query */}
          {showRecentSearches && !isSearching && (
            <div className="py-2">
              <div className="flex items-center justify-between px-5 py-1">
                <span className="text-xs text-gray-500">Recent searches</span>
                <button onClick={clearRecentSearches} className="text-xs text-blue-600 hover:underline">
                  Clear all
                </button>
              </div>
              {recentSearches.map((term, idx) => (
                <button
                  key={idx}
                  onClick={() => handleRecentClick(term)}
                  className="w-full flex items-center gap-3 px-5 py-2.5 hover:bg-gray-100 transition-colors"
                >
                  <Clock size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-800 flex-1 text-left">{term}</span>
                  <ArrowRight size={14} className="text-gray-400" />
                </button>
              ))}
            </div>
          )}

          {/* Email Results */}
          {!isSearching && searchResults && searchResults.emails.length > 0 && (
            <div className="py-1">
              <div className="px-5 py-2 flex items-center gap-2">
                <Mail size={14} className="text-blue-500" />
                <span className="text-xs font-medium text-gray-500">
                  Emails • {searchResults.totalEmails} found
                </span>
              </div>
              {searchResults.emails.map((email) => (
                <button
                  key={email.id}
                  onClick={() => handleEmailClick(email.id)}
                  className="w-full flex items-center gap-3 px-5 py-2.5 hover:bg-gray-100 transition-colors"
                >
                  {email.newsletterLogo ? (
                    <Image
                      src={email.newsletterLogo}
                      alt=""
                      width={24}
                      height={24}
                      className="rounded flex-shrink-0"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Mail size={12} className="text-blue-600" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm text-gray-900 truncate">{email.subject || "No Subject"}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {email.newsletterName || email.sender}
                    </p>
                  </div>
                </button>
              ))}
              {searchResults.totalEmails > 5 && (
                <button
                  onClick={() => handleSubmit()}
                  className="w-full px-5 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors text-left"
                >
                  See all {searchResults.totalEmails} email results
                </button>
              )}
            </div>
          )}

          {/* Newsletter Results */}
          {!isSearching && searchResults && searchResults.newsletters.length > 0 && (
            <div className="py-1 border-t border-gray-100">
              <div className="px-5 py-2 flex items-center gap-2">
                <Globe size={14} className="text-green-500" />
                <span className="text-xs font-medium text-gray-500">
                  Newsletters • {searchResults.totalNewsletters} found
                </span>
              </div>
              {searchResults.newsletters.map((newsletter) => (
                <button
                  key={newsletter.id}
                  onClick={() => handleNewsletterClick(newsletter.id)}
                  className="w-full flex items-center gap-3 px-5 py-2.5 hover:bg-gray-100 transition-colors"
                >
                  {newsletter.logo ? (
                    <Image
                      src={newsletter.logo}
                      alt=""
                      width={24}
                      height={24}
                      className="rounded flex-shrink-0"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Globe size={12} className="text-green-600" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm text-gray-900 truncate">{newsletter.name}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {newsletter.description || newsletter.domain}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {!isSearching && query.trim() && searchResults && !hasResults && (
            <div className="px-5 py-4 text-center">
              <p className="text-sm text-gray-600">
                No results for "<span className="font-medium">{query}</span>"
              </p>
              <p className="text-xs text-gray-400 mt-1">Try different keywords</p>
            </div>
          )}

          {/* Keyboard hints */}
          {query.trim() && (
            <div className="px-5 py-2 border-t border-gray-100 bg-gray-50 flex items-center gap-4 text-xs text-gray-500">
              <span>
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-[10px] font-mono shadow-sm">
                  Enter
                </kbd>{" "}
                to search
              </span>
              <span>
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-[10px] font-mono shadow-sm">
                  Esc
                </kbd>{" "}
                to close
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
