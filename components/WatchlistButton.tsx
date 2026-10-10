
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";

type WatchlistButtonProps = {
  movieId: string | number;
  movieTitle: string;
  className?: string;
};

export default function WatchlistButton({
  movieId,
  movieTitle,
  className = "",
}: WatchlistButtonProps) {
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [inWatchlist, setInWatchlist] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const apiUrl = `/api/movies/${encodeURIComponent(String(movieId))}/watchlist`;

  useEffect(() => {
    let cancelled = false;

    setInWatchlist(false);
    setMessage("");

    if (authLoading || !isAuthenticated) {
      return () => {
        cancelled = true;
      };
    }

    async function checkWatchlist() {
      try {
        const response = await fetch(apiUrl, {
          credentials: "same-origin",
          cache: "no-store",
        });

        if (!response.ok) return;

        const data = await response.json();

        if (!cancelled) {
          setInWatchlist(data.inWatchlist);
        }
      } catch (error) {
        console.error("Watchlist check failed:", error);
      }
    }

    void checkWatchlist();

    return () => {
      cancelled = true;
    };
  }, [apiUrl, isAuthenticated, authLoading]);

  async function handleClick() {
    setMessage("");

    if (authLoading || busy) return;

    if (!isAuthenticated) {
      window.dispatchEvent(new Event("showhouse:open-login"));
      setMessage("Please log in to use your watchlist.");
      return;
    }

    setBusy(true);

    try {
      const response = await fetch(apiUrl, {
        method: inWatchlist ? "DELETE" : "POST",
        credentials: "same-origin",
        headers: inWatchlist
          ? undefined
          : { "Content-Type": "application/json" },
        body: inWatchlist
          ? undefined
          : JSON.stringify({ title: movieTitle }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          window.dispatchEvent(new Event("showhouse:open-login"));
          setMessage("Please log in first.");
        } else {
          setMessage(data.error || "Unable to update watchlist.");
        }
        return;
      }

      setInWatchlist(data.inWatchlist);
      setMessage(
        data.inWatchlist
          ? "Added to your watchlist."
          : "Removed from your watchlist."
      );
    } catch (error) {
      console.error("Watchlist update failed:", error);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={authLoading || busy}
        aria-pressed={inWatchlist}
        className={`mb-1 mt-3 flex h-[38px] min-w-[110px] items-center justify-center gap-2 rounded-full border-0 bg-slate-100 px-3 py-2 text-slate-800 font-bold cursor-pointer transition-colors hover:bg-slate-800 hover:text-slate-100 disabled:cursor-not-allowed disabled:opacity-60 ${
          className
        }`}
      >
        <span className="whitespace-nowrap">
          {authLoading
            ? "Loading..."
            : busy
              ? "Please wait..."
              : inWatchlist
                ? "In Watchlist"
                : "Watch Later"}
        </span>

        <Image
          src="/add_to_queue_symbol.png"
          height={20}
          width={25}
          alt=""
          aria-hidden="true"
          className="shrink-0 object-contain"
        />
      </button>

      {message && (
        <p role="status" className="mt-2 text-sm text-white">
          {message}
        </p>
      )}
    </div>
  );
}
