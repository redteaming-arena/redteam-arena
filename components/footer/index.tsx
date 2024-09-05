"use client";
import React from "react";
import Link from "next/link";
import  GithubIcon from "@/assets/svg//github";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import XIcon from "@/assets/svg/x";

export default function Footer() {
  return (
    <footer className=" text-white py-3">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Footer Links */}
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <Link href="/" className="hover:text-gray-400">
              Home
            </Link>
            <Link href="/leaderboard" className="hover:text-gray-400">
            Leaderboard
            </Link>
            <Link href="/games" className="hover:text-gray-400">
              Games
            </Link>
          </div>

          {/* Social Media Icons */}
          <div className="flex gap-4 mb-6">
          <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gray-400"
                  >
                    <GithubIcon className="w-5 h-5" />
                  </a>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gray-400"
                  >
                    <XIcon className="w-5 h-5" />
                  </a>
          </div>
        </div>

        {/* Footer Description */}
        {/* <div className="text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Your Company. All rights reserved.</p>
        </div> */}
      </div>
    </footer>
  );
}
