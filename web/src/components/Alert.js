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

export function AlertDialogWarning({ children, onStart }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasAgreed, setHasAgreed] = useState(false);
  const [shouldCallOnStart, setShouldCallOnStart] = useState(false);

  useEffect(() => {
    const warned = Cookies.get("_warned_agreement") === "true";
    setHasAgreed(warned);
    if (!warned) {
      setIsOpen(true);
    }
  }, []);

  const handleCancel = () => {
    setIsOpen(false);
  };

  const handleContinue = () => {
    setHasAgreed(true);
    setIsOpen(false);
    Cookies.set("_warned_agreement", "true", { expires: 7 });
    if (shouldCallOnStart) {
      onStart();
      setShouldCallOnStart(false);
    }
  };

  const handleTriggerClick = (e) => {
    if (Cookies.get("_warned_agreement") === "true") {
      onStart();
    } else {
      e.preventDefault();
      setIsOpen(true);
      setShouldCallOnStart(true);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild onClick={handleTriggerClick}>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-black text-white text-left">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl"></AlertDialogTitle>
          <AlertDialogDescription>
            <span className="text-xl">Warning: some content may contain racist, sexual, violent, or other strong language.</span>
            <br />
            <span className="text-sm text-white">
              Note: this research preview collects user dialogue data, and reserves the right to distribute it under a CC-BY license. Learn more about the terms <a href="https://redarena.ai/terms" className="underline">here</a>.
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