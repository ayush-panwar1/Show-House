"use client";

import { useEffect, useState } from "react";

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
    <section className="px-6 py-12">
      <div className="mx-auto max-w-5xl">
        {/* SUCCESS */}
        {AuthenticationState === "success" && (
          <>
            <div className="mb-10">
              <h1 className="text-4xl font-semibold tracking-tight text-[#F54927]">
                Welcome, {Name || "User"}
              </h1>

              {/* <p className="mt-2 text-gray-500 dark:text-gray-400">
                You currently don&apos;t have any personal collection. Start
                creating your custom movie collections. You can also share
                them with others and follow profiles you like.
              </p> */}
            </div>

            <div className="mb-8 border-t border-gray-200 dark:border-gray-700" />

            <div className="grid grid-cols-1 gap-x-10 gap-y-6 text-sm sm:grid-cols-2">
              <div>
                <p className="mb-1 text-gray-500 dark:text-gray-400">
                  Name
                </p>
                <p className="text-lg font-medium">{Name || "-"}</p>
              </div>

              <div>
                <p className="mb-1 text-gray-500 dark:text-gray-400">
                  Email
                </p>
                <p className="break-all text-lg font-medium">
                  {userEmail || "-"}
                </p>
              </div>

              <div>
                <p className="mb-1 text-gray-500 dark:text-gray-400">
                  Username
                </p>
                <p className="text-lg font-medium">{userName || "-"}</p>
              </div>
            </div>
          </>
        )}

        {/* FAIL */}
        {AuthenticationState === "fail" && (
          <div className="mt-10">
            <h2 className="mb-2 text-2xl font-semibold text-red-500">
              Login failed
            </h2>

            <p className="text-gray-500 dark:text-gray-400">
              Something went wrong. Try again.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}