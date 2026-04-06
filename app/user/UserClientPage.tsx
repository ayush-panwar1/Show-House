"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type Props = {
  status?: string;
};

export default function HomeClientPage({ status }: Props) {
  const AuthenticationState = status;

  const [Name, setName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    async function getUserinfo() {
      try {
        const res = await fetch("/api/user/home", {
          credentials: "include",
        });

        if (!res.ok) return;

        const data = await res.json();

        setName(data.data.first_name);
        setUserEmail(data.data.email);
        setUserName(data.data.username);
      } catch (err) {
        console.error(err);
      }
    }

    getUserinfo();
  }, []);

  return (
    <>
      <Navbar />

      <div className="min-h-screen px-6 py-16 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100">
        <div className="max-w-5xl mx-auto">

          {/* SUCCESS */}
          {AuthenticationState === "success" && (
            <>
              {/* Header */}
              <div className="mb-10">
                <h1 className="text-4xl font-semibold tracking-tight text-[#F54927]">
                  Welcome, {Name || "User"}
                </h1>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                  You currently don&apos;t have any personal collection. Start
                  creating your custom movie collections. You can also share them
                  with others and follow profiles you like.
                </p>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 dark:border-gray-700 mb-8" />

              {/* Account Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-10 text-sm">

                <div>
                  <p className="text-gray-500 dark:text-gray-400 mb-1">Name</p>
                  <p className="text-lg font-medium">{Name || "-"}</p>
                </div>

                <div>
                  <p className="text-gray-500 dark:text-gray-400 mb-1">Email</p>
                  <p className="text-lg font-medium break-all">{userEmail || "-"}</p>
                </div>

                <div>
                  <p className="text-gray-500 dark:text-gray-400 mb-1">Username</p>
                  <p className="text-lg font-medium">{userName || "-"}</p>
                </div>
              </div>
            </>
          )}

          {/* FAIL */}
          {AuthenticationState === "fail" && (
            <div className="mt-10">
              <h2 className="text-2xl font-semibold text-red-500 mb-2">
                Login failed
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Something went wrong. Try again.
              </p>
            </div>
          )}

        </div>
      </div>

      <Footer />
    </>
  );
}