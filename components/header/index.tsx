"use client";
import React, {useState, useEffect} from "react";
import Link from "next/link";
import NavigationLogo from "../logo/navigation-logo";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Navigation } from "../navagation/menu";
import { Cross1Icon, HamburgerMenuIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { AvatarImage } from "@radix-ui/react-avatar";
import { getCookie } from "cookies-next";
import { DropdownAvatar } from "../dropdown/user";
import { Button } from "../ui/button";

function MobileHeader({ visible = false, isLoggedIn = false }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className={cn(" fixed w-full z-20 bg-black",)}>
      {/* Conditional Gradient background */}
      {isMenuOpen && (
        <div className="absolute inset-0 bg-opacity-90 h-screen z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black/50 z-20 backdrop-blur-lg"></div>
        </div>
      )}

      <div className="flex justify-between items-center px-4 py-2 relative z-10">
        <NavigationLogo />
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2">
          {isMenuOpen ? <Cross1Icon className="h-5 w-5" /> : <HamburgerMenuIcon className="h-5 w-5" />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="px-4 py-2 relative z-10">
          <Navigation />
          <div className="w-full">
            {!isLoggedIn ? (
              <Link
                href="/login"
                className="block text-center text-white px-2 py-1 rounded-lg"
              >
                Sign in
              </Link>
            ) : (

              <div className="flex flex-col w-full p-1 gap-x-1">
                <h1 className="px-3 w-full bg-gradient-to-r from-black via-black/50 to-transparent rounded-xl">Account</h1>
                <Button className="w-full" variant="link">
                  {getCookie("username")}
                </Button>
                <Button className="w-full" variant="outline">
                  Log out
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


export default function Header({}) {

  const [isMobile, setIsMobile] = useState(false);
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [loggedIn, setLoggedIn] = useState(false);
  useEffect(() => {
    const cookie = getCookie("ra_token_verification");
    console.log(cookie)
    setLoggedIn(cookie !== undefined )

    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768); // Adjust this breakpoint as needed
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    const controlNavbar = () => {
      if (window.scrollY > lastScrollY) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      setLastScrollY(window.scrollY);
    };

    window.addEventListener('scroll', controlNavbar);
    return () => {
      window.removeEventListener('scroll', controlNavbar);
    };
  }, [lastScrollY]);

  if (isMobile) {
    return <MobileHeader isLoggedIn={loggedIn} />;
  }

  return (
    <div className={cn(" fixed w-screen flex justify-between items-center px-4 p-4 backdrop-blur-md z-20 duration-500", visible ? 'opacity-100' : 'opacity-0')}>
      <NavigationLogo />
      <div className="flex-grow flex justify-center z-20">
        <Navigation />
      </div>
      <div className="flex-shrink-0 w-8"></div>
      {!loggedIn && (
        <Link
          href={"/login"}
          className="text-white z-10 px-2 py-1 rounded-lg bg-zinc-950 border border-black"
        >
          Sign in
        </Link>
      )}
      {loggedIn && (
        <DropdownAvatar>
          <Avatar className="p-2  border-[1px]">
            <AvatarImage src={`/api/user/icon/${getCookie("username")} `}></AvatarImage>
            <AvatarFallback className="z-10 shadow-lg">{getCookie("username")?.slice(0, 2) || "0x"}</AvatarFallback>
          </Avatar>
        </DropdownAvatar>
      )}
    </div>
  );
}