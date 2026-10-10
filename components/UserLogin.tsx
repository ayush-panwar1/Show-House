"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import LoginForm from "./LoginForm";
import SignUpForm from "./SignUpForm";
import { useAuth } from "@/context/AuthContext";

export default function UserLogin() {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [view, setView] = useState("login");

  const { user, isAuthenticated, loading, logout, refreshAuth } =
    useAuth();

  const closeModal = () => {
    setIsModalOpen(false);
    setView("login");
  };

  const openModal = (selectedView: string) => {
    setView(selectedView);
    setIsOpen(false);
    setIsModalOpen(true);
  };

  return (
    <div
      className="relative flex items-center justify-center text-black dark:text-gray-100"
      onMouseEnter={() => !loading && setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Account icon with existing hover movement */}
      {loading ? (
        <div style={{ height: "40px", width: "40px" }} />
      ) : (
        <button
          type="button"
          aria-label="Account menu"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((prev) => !prev)}
          className={`px-1 py-0 rounded-full cursor-pointer
            transition-transform duration-300 ease-in-out
            hover:-translate-y-1 hover:scale-110
            ${isOpen ? "-translate-y-1" : ""}`}
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
      )}

      {/* Hover dropdown */}
      {isOpen && !loading && (
        <div
          className="absolute right-0 top-full z-[100] w-56 pt-0"
          onMouseEnter={() => setIsOpen(true)}
        >
          <div className="overflow-hidden rounded-lg border border-gray-200
            bg-white text-gray-800 shadow-xl
            dark:border-slate-600 dark:bg-slate-800 dark:text-gray-100
            animate-in fade-in slide-in-from-top-2 duration-200"
          >
            {isAuthenticated ? (
              <>
                <div className="border-b border-gray-200 px-4 py-3
                  dark:border-slate-600">
                  <p className="truncate text-sm font-semibold">
                    {user?.name || user?.email || "My Account"}
                  </p>
                  {user?.email && user?.name && (
                    <p className="mt-1 truncate text-xs text-gray-500
                      dark:text-gray-400">
                      {user.email}
                    </p>
                  )}
                </div>

                <div className="py-1">
                  <Link
                    href="/user?status=success"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-2.5 text-sm transition-colors
                      hover:bg-[#00CEC8]/15 hover:text-[#009f9b]"
                  >
                    Profile
                  </Link>

                  <Link
                    href="/user?status=success"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-2.5 text-sm transition-colors
                      hover:bg-[#00CEC8]/15 hover:text-[#009f9b]"
                  >
                    Watchlist
                  </Link>
                </div>

                <div className="border-t border-gray-200 py-1
                  dark:border-slate-600">
                  <button
                    type="button"
                    onClick={async () => {
                      setIsOpen(false);
                      try {
                        await logout();
                      } catch (error) {
                        console.error(error);
                      }
                    }}
                    className="block w-full cursor-pointer px-4 py-2.5
                      text-left text-sm text-red-500 transition-colors
                      hover:bg-red-500/10"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <div className="py-1">
                <button
                  type="button"
                  onClick={() => openModal("login")}
                  className="block w-full cursor-pointer px-4 py-2.5
                    text-left text-sm transition-colors
                    hover:bg-[#00CEC8]/15 hover:text-[#009f9b]"
                >
                  Sign In
                </button>

                <button
                  type="button"
                  onClick={() => openModal("signup")}
                  className="block w-full cursor-pointer px-4 py-2.5
                    text-left text-sm transition-colors
                    hover:bg-[#00CEC8]/15 hover:text-[#009f9b]"
                >
                  Create Account
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Existing login/signup modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center
            bg-black/50"
          onClick={closeModal}
        >
          <div
            className="flex w-[90%] max-w-md flex-col items-center
              rounded-xl p-6 shadow-2xl"
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
            <div className="flex w-full justify-end">
              <button
                type="button"
                onClick={closeModal}
                className="cursor-pointer border-none bg-transparent text-sm"
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

            <div className="flex w-full flex-col items-center">
              {view === "login" ? (
                <LoginForm
                  onSwitch={() => setView("signup")}
                  onLoginSuccess={async () => {
                    await refreshAuth();
                    closeModal();
                  }}
                />
              ) : (
                <SignUpForm
                  onSwitch={() => setView("login")}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
