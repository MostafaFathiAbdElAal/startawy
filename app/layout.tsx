import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import Script from "next/script";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { cookies } from "next/headers";
import { verifyAuth } from "@/lib/auth-utils";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { prisma } from "@/lib/prisma";
import "./globals.css";

export const dynamic = 'force-dynamic';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Startawy | Startup Consulting Platform",
    template: "%s | Startawy",
  },
  description: "Professional consulting platform for startups and consultants.",
  icons: {
    icon: [
      { url: "/assets/logos/startawy_s_16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/assets/logos/startawy_s_32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/assets/logos/startawy_s_48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/assets/logos/startawy_s_64x64.png", sizes: "64x64", type: "image/png" },
    ],
    apple: [
      { url: "/assets/logos/startawy_s_180x180.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  const userPayload = await verifyAuth(token);
  const isAuthenticated = !!userPayload;
  const userRole = userPayload?.role as string | undefined;
  
  // Real-time check from DB to ensure chat sync is perfect
  let isPhoneVerified = false;
  let userName = userPayload?.name as string | undefined; // Moved and changed to let
  
  if (userPayload?.id) {
    const freshUser = await prisma.user.findUnique({
      where: { id: Number(userPayload.id) },
      select: { isPhoneVerified: true, name: true } // Added name to select
    });
    isPhoneVerified = freshUser?.isPhoneVerified ?? false;
    userName = freshUser?.name || userName; // Added line to override userName
  }

  return (
    <html lang="en" translate="no" suppressHydrationWarning>
      <head>
        <meta name="google" content="notranslate" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} font-outfit antialiased`}
      >
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
        <ThemeProvider>
          <ToastProvider>
            {children}
            <ChatWidget 
              isAuthenticated={isAuthenticated} 
              userRole={userRole} 
              userName={userName}
              isOwner={!!userPayload?.isOwner}
              key={isPhoneVerified ? 'verified' : 'unverified'} 
              isPhoneVerified={isPhoneVerified} 
            />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
