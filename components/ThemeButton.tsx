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
      setLogoPath("/bedtime_icon.svg");
    }
  }, [dark]);

  return (
  
          <button
        onClick={() => setDark(!dark)}
        className="px-1 py-0 rounded-full cursor-pointer
                  transition-transform duration-300 ease-in-out
                  hover:-translate-y-1 hover:scale-110"
        style={{ height: "40px", width: "40px" }}
      >
      <Image
        src={logoPath}
        alt="Toggle Theme"
        width={30}
        height={30}
        style={{ height: "30px", width: "30px" }}
      />
    </button>
  );
}