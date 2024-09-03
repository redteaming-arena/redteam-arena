import Header from "@/components/header";
import { Suspense } from "react";
import LoadingPage from "./loading";
import HeroSection from "@/components/hero";
import { AccordionJailbreak } from "@/components/accordance";
import { generateMetadata } from "@/utils/metadata";
import { cookies } from "next/headers";
import Footer from "@/components/footer";

export const metadata = generateMetadata("/");

export default async function Home() {


  return (<>
      <Header/>
      <main className="flex min-h-screen">
        <div className="z-0 w-full max-w-5xl font-mono text-sm lg:flex">
          <HeroSection />
        </div>
      </main>
      <section className=" w-1/2 mx-auto mb-20">
          <AccordionJailbreak />
      </section>
      <Footer />
      </>
  );
}
