import { Suspense } from "react";
import "../globals.css";
import { Roboto_Mono, Inter as FontSans } from "next/font/google";
import { cn } from "@/lib/utils";
import LoadingPage from "../loading";
import { generateMetadata } from "@/utils/metadata";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

const roboto_mono = Roboto_Mono({ subsets: ["latin"] });

export const metadata = generateMetadata("");

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
        <Suspense fallback={<LoadingPage />}>{children}</Suspense>
    </>
  );
}