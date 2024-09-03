import { Suspense } from "react";
import "./globals.css";
import { Inter as FontSans } from "next/font/google";
import { cn } from "@/lib/utils";
import LoadingPage from "./loading";
import { Toaster } from "@/components/ui/toaster";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background bg-black font-sans antialiased text-white",
          fontSans.variable
        )}
      >
          {children}
          <Toaster/>
      </body>
    </html>
  );
}
