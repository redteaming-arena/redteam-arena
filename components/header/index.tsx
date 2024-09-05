"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import NavigationLogo from "../logo/navigation-logo";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { cn } from "@/lib/utils";
import { getCookie, setCookie } from "cookies-next";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

const pageOptions = [
  { name: "Leaderboard", href: "/leaderboard" },
  { name: "Games", href: "/games" },
];

function LoginForm({ onClose, onLogin }) {
  const [username, setUsername] = useState("Joe Smoe");
  const [password, setPassword] = useState("12345");
  const formRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (formRef.current && !formRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(username);
    setCookie("ra_token_verification", "dummy_token");
    setCookie("username", username);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} ref={formRef} className="flex items-center space-x-2 bg-zinc-800 p-2 rounded-lg">
      <Input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-32"
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-32"
      />
      <Button type="submit" className="bg-zinc-700">Login</Button>
      <Button onClick={onClose} className="bg-zinc-700">Close</Button>
    </form>
  );
}

export default function Header() {
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [loggedIn, setLoggedIn] = useState(false);
  const [isLoginExpanded, setIsLoginExpanded] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const cookie = getCookie("ra_token_verification");
    const storedUsername = getCookie("username");
    setLoggedIn(!!cookie);
    setUsername(storedUsername || "");

    const handleScroll = () => {
      setVisible(window.scrollY <= lastScrollY);
      setLastScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleLogin = (newUsername) => {
    setLoggedIn(true);
    setUsername(newUsername);
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setUsername("");
    setCookie("ra_token_verification", "", { maxAge: 0 });
    setCookie("username", "", { maxAge: 0 });
  };

  return (
    <div className={cn("fixed w-full flex justify-between items-center px-4 py-4 backdrop-blur-md z-20 transition-opacity duration-500", visible ? "opacity-100" : "opacity-0")}>
      <NavigationLogo />
      <nav className="flex space-x-4">
        {pageOptions.map((option) => (
          <Link key={option.name} href={option.href} className="text-white px-2 py-1 rounded-lg hover:bg-zinc-800">
            {option.name}
          </Link>
        ))}
      </nav>
      {!loggedIn ? (
        isLoginExpanded ? (
          <LoginForm onClose={() => setIsLoginExpanded(false)} onLogin={handleLogin} />
        ) : (
          <Button onClick={() => setIsLoginExpanded(true)} className="text-white px-2 py-1 rounded-lg bg-zinc-950 border border-black">
            Sign in
          </Button>
        )
      ) : (
        <div className="flex items-center space-x-2 bg-zinc-800 p-2 rounded-lg">
          <span className="text-white">{username.slice(0, 6)}...</span>
          <Avatar className="w-8 h-8 border-[1px]">
            <AvatarImage src={`/api/user/icon/${username}`} />
            <AvatarFallback>{username?.slice(0, 2) || "0x"}</AvatarFallback>
          </Avatar>
          <Button variant="outline" onClick={handleLogout}>Log out</Button>
        </div>
      )}
    </div>
  );
}