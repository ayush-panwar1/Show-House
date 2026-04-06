"use client";

import { useState } from "react";
import Image from "next/image";
import LoginForm from "./LoginForm";
import SignUpForm from "./SignUpForm";

export default function UserLogin() {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState("login"); // 'login' or 'signup'

  const closeModal = () => {
    setIsOpen(false);
    setView("login"); // Reset to login view for the next time it opens
  };

  return (
    <div className="flex items-center justify-center text-black">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        // className="px-0 py-0  cursor-pointer flex items-center justify-center"
        className="px-1 hover:pb-3 py-0  rounded-full cursor-pointer"

        style={{ height: "40px", width: "40px" }}
      >
        <Image
          src="/user-icon.svg"
          alt="User Logo"
          width={30}
          height={30}
          style={{ height: "30px", width: "30px" }}
        />
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          {/* Main Modal Box */}
          <div
            className="w-[90%] max-w-md p-6 rounded-xl flex flex-col items-center shadow-2xl transform transition-all duration-200 scale-100"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "350px",
              height: "550px", 
              background: `
                radial-gradient(circle at 100% 50%, transparent 20%, #65ceeb 21%, #65ceeb 34%, transparent 35%, transparent),
                radial-gradient(circle at 0% 50%, transparent 20%, #65ceeb 21%, #65ceeb 34%, transparent 35%, transparent) 0 -50px
              `,
              backgroundColor: "#fafafa",
              backgroundSize: "75px 100px",
            }}
          >
            {/* Close Button Row */}
            <div className="flex w-full justify-end">
              <button
                onClick={closeModal}
                className="text-sm cursor-pointer border-none bg-transparent"
              >
                <Image
                  src="/cross-logo.svg"
                  alt="Close Modal"
                  width={40}
                  height={40}
                  style={{ height: "40px", width: "40px" }}
                />
              </button>
            </div>

            {/* Content Switcher */}
            <div className="w-full flex flex-col items-center">
              {view === "login" ? (
                <LoginForm onSwitch={() => setView("signup")} />
              ) : (
                <SignUpForm onSwitch={() => setView("login")} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}