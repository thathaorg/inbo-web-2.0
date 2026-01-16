

// import { appWithTranslation } from "next-i18next";
// import { useEffect } from "react";

// // App Router uses a Client Component to run effects
// "use client";

// function RootProvider({ children }: { children: React.ReactNode }) {
//   useEffect(() => {
//     DeepLinkHandler.getInstance();
//   }, []);

//   return (
//     <>
//       <DefaultSEO />
//       <AuthProvider>{children}</AuthProvider>
//     </>
//   );
// }

// function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="en">
//       <body>
//         <RootProvider>{children}</RootProvider>
//       </body>
//     </html>
//   );
// }

// export default appWithTranslation(RootLayout);

//correct code
import "../styles/globals.css";
import type { ReactNode } from "react";
import ClientProviders from "./ClientProviders";
import { Toaster } from "sonner";

export const metadata = {
  title: "inbo",
  description: "inbo platform",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ClientProviders>
          {children}

          {/* Global toast system */}
          <Toaster richColors position="top-right" />
        </ClientProviders>
      </body>
    </html>
  );
}



