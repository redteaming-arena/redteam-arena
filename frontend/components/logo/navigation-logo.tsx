"use client";

import Link from "next/link";
import { redirect } from "next/navigation";

export default function NavigationLogo() {
    
    return (  
    <Link href={"/"} className="flex-shrink-0 text-white z-20 font-bold text-xl">
        {"/>"}
    </Link>)
}