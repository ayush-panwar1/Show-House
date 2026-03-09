"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [logoPath, setLogoPath] = useState("/moon-logo.svg")

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  function handleThemeChange(){
    setDark(!dark);
    if(dark){
      setLogoPath("/moon-logo.svg")
    }
    else{
      setLogoPath("/sun-logo.svg")
    }
  }
  return (
    <>
      <button
        onClick={() => {
          handleThemeChange()

        }}
        className="px-0 py-0 bg-slate-50  rounded-full cursor-pointer "
      >
        
        <Image
          src={logoPath}
          alt="Toggle Theme"
          width={65}
          height={35}
          style={{ height: "35px", width: "65px" }}
          // className="object-contain"
        ></Image>
      </button>
    </>
  );
}
