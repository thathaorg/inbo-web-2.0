

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
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700&family=Lora:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning className="antialiased">
        <ClientProviders>
          {children}

          {/* Global toast system */}
          <Toaster richColors position="top-right" />
        </ClientProviders>
      </body>
    </html>
  );
}



