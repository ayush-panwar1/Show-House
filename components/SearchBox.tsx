"use client";
import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react";


type tmdb = {
    id: number;
    title: string;
};
export default function SearchBox() {
    const [searchVal, setSearchVal] = useState("");
    const [debouncedVal, setDebouncedVal] = useState("");
    const [movieList, setMovieList] = useState<tmdb[]>([]);
    const [noMatch, setNoMatch] = useState(false);


    // debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedVal(searchVal);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchVal]);


    useEffect(() => {
        if (!debouncedVal) return;

        const controller = new AbortController();


        async function getSearchResult() {
            try {
                if(debouncedVal.length <=3)return;
                setNoMatch(false);
                const res = await fetch(
                    `/api/search?q=${encodeURIComponent(debouncedVal)}`,
                    { signal: controller.signal }
                );

                if (!res.ok) {
                    setMovieList([]);
                    return;
                }

                const data = await res.json();

                // Handle no results found
                if (data.movies.length === 0) {
                    setNoMatch(true);
                } else {
                    setNoMatch(false);
                }

                setMovieList(data.movies);

            } catch (err: unknown) { // Use unknown instead of any
                // Check if the error is specifically an AbortError
                if (err instanceof Error) {
                    if (err.name === "AbortError") {
                        // Ignore abort errors as they are intentional
                        return;
                    }
                    console.error("Fetch Error:", err.message);
                } else {
                    console.error("An unexpected error occurred:", err);
                }
            }
        }
        getSearchResult();

        return () => controller.abort();
    }, [debouncedVal]);





    const Genre = [
        { id: 28, name: "Action" },
        { id: 12, name: "Adventure" },
        { id: 16, name: "Animation" },
        { id: 35, name: "Comedy" },
        { id: 80, name: "Crime" },
        { id: 99, name: "Documentary" },
        { id: 18, name: "Drama" },
        { id: 10751, name: "Family" },
        { id: 14, name: "Fantasy" },
        { id: 36, name: "History" },
        { id: 27, name: "Horror" },
        { id: 10402, name: "Music" },
        { id: 9648, name: "Mystery" },
        { id: 10749, name: "Romance" },
        { id: 878, name: "Science Fiction" },
        { id: 10770, name: "TV Movie" },
        { id: 53, name: "Thriller" },
        { id: 10752, name: "War" },
        { id: 37, name: "Western" }
    ];


    return (



        <div className="relative group  flex flex-col bg-blue-50 border border-slate-300 rounded-full">
            <div className=" flex flex-row gap-0 ">
                <input
                    type="search"
                    className="
                                bg-blue-50
                                text-slate-800
                                w-[100px] sm:w-[150px]
                                group-hover:w-[300px] sm:group-hover:w-[500px]
                                focus:w-[300px] sm:focus:w-[500px]
                                h-[35px]
                                // px-4 
                                // ps-4
                                rounded-full
                                
                                text-center
                                transition-all duration-300 ease-in-out
                                focus:outline-none
                                pe-0
                                ps-[25px]
                                "
                    placeholder="Search"
                    value={searchVal}
                    onChange={(e) => setSearchVal(e.target.value)}
                />

                <Image src="/magnifying-glass.svg"
                    height={30}
                    width={30}
                    alt="search-icon"
                    className="bg-blue-50  rounded-full
                "
                ></Image>

            </div>
            {/* Dropdown */}


            <div
                className="
                            text-slate-800
                            absolute
                            top-full
                            left-0
                            mt-0
                            w-[300px]
                            sm:w-[530px]
                            flex flex-col gap-2
                            bg-slate-50
                            px-3
                            py-0
                            // rounded-xl
                            rounded-b-xl
                            shadow-lg
                            z-50
                            opacity-0
                            pointer-events-none
                            group-hover:opacity-100
                            group-hover:pointer-events-auto
                            transition-opacity duration-200
                            "
            >
                {/*  SEARCH RESULTS (TOP PRIORITY) */}
                {debouncedVal && movieList.length > 0 && (
                    <div className="flex flex-col gap-2 p-2">
                        {movieList.map((m) => (
                            <Link
                                key={m.id}
                                href={`/movie/${m.id}`}
                                className="custom_pill_box"
                            >
                                {m.title}
                            </Link>
                        ))}
                    </div>
                )}

                {/*  GENRES (DEFAULT / FALLBACK) */}
                {!debouncedVal && (
                    <div className="flex flex-wrap gap-2 justify-center rounded-b-xl py-0 pb-2 pt-2">
                        {Genre.map((g) => (
                            <Link
                                key={g.id}
                                href={`/movie/genre/${g.id}/${g.name
                                    .toLowerCase()
                                    .replace(/\s+/g, "-")}?page=1`}
                            >
                                <div className="custom_pill_box">{g.name}</div>
                            </Link>
                        ))}
                    </div>
                )}
                {noMatch && <div className="text-slate-800">No Match Found</div>}
            </div>
        </div>


    );
}