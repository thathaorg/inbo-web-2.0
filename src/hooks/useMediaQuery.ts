import { useState, useEffect } from "react";

export function useMediaQuery(query: string) {
  // Initialize with undefined to handle SSR
  const [matches, setMatches] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);

    return () => media.removeEventListener("change", listener);
  }, [query]);

  // Return false during SSR to render desktop version by default
  return matches ?? false;
}
