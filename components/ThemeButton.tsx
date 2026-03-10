"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function ThemeToggle() {

  const [dark, setDark] = useState(false);
  const [logoPath, setLogoPath] = useState("/moon-logo.svg");

  // Load saved theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
      setDark(true);
      setLogoPath("/sun-logo.svg");
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Apply theme whenever it changes
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setLogoPath("/sun-logo.svg");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setLogoPath("/moon-logo.svg");
    }
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      className="px-0 py-0 bg-slate-50 rounded-full cursor-pointer"
    >
      <Image
        src={logoPath}
        alt="Toggle Theme"
        width={65}
        height={35}
        style={{ height: "35px", width: "65px" }}
      />
    </button>
  );
}