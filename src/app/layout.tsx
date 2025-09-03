import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import type { Metadata } from "next";
import { Fira_Code, Inter } from "next/font/google";
// local import
import RootProvider from "@/components/providers/root-provider";
import { Toaster } from "@/components/ui/sonner";
// css import
import "./globals.css";

const interSans = Inter({
  variable: "--font-inter-sans",
  subsets: ["latin"],
});

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Smart Spender",
  description: "Spend your money wisely.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        elements: {
          formButtonPrimary: "bg-blue-500 hover:bg-blue-600",
        },
      }}
    >
      <html
        lang="en"
        suppressHydrationWarning
        className="dark"
        style={{ colorScheme: "dark" }}
      >
        <body
          className={`${interSans.variable} ${firaCode.variable} antialiased`}
        >
          <Toaster richColors position="top-center" />
          <RootProvider>{children}</RootProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
