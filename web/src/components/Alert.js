import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";

const COOKIE_NAME = "_warned_agreement";
const COOKIE_EXPIRY = 7;

export function AlertDialogWarning({ children, onStart }) {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldCallOnStart, setShouldCallOnStart] = useState(false);

  useEffect(() => {
    const warned = Cookies.get(COOKIE_NAME) === "true";
    if (!warned) {
      setIsOpen(true);
    }
  }, []);

  const handleCancel = () => setIsOpen(false);

  const handleContinue = () => {
    setIsOpen(false);
    Cookies.set(COOKIE_NAME, "true", { expires: COOKIE_EXPIRY });
    if (shouldCallOnStart) {
      onStart();
      setShouldCallOnStart(false);
    }
  };

  const handleTriggerClick = (e) => {
    if (Cookies.get(COOKIE_NAME) === "true") {
      onStart();
    } else {
      e.preventDefault();
      setIsOpen(true);
      setShouldCallOnStart(true);
    }
  };

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (Cookies.get(COOKIE_NAME) !== "true") {
          setIsOpen(false);
        } else {
          setIsOpen(open);
        }
      }}
    >
      <AlertDialogTrigger asChild onClick={handleTriggerClick}>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-black text-white text-left">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl" />
          <AlertDialogDescription>
            <span className="text-xl">
              Warning: some content may contain racist, sexual, violent, or other strong language.
            </span>
            <br />
            <span className="text-sm text-white">
              Note: this research preview collects user dialogue data, and reserves the right to distribute it under a CC-BY license. Learn more about the terms{" "}
              <a href="https://redarena.ai/terms" className="underline">
                here
              </a>
              .
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            className="bg-zinc-900 hover:bg-zinc-800 hover:text-white border-0"
            variant="default"
            onClick={handleCancel}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="text-black bg-white hover:bg-white/80"
            variant="default"
            onClick={handleContinue}
          >
            Agree
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}