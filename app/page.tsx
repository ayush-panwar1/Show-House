// 'use client'
import Image from "next/image";
import MoviesListByGenre from "@/components/MoviesListByGenre";
import Footer from "@/components/Footer"

import MoviesByVariant from "@/components/MoviesByVariant";
// import Image from "next/image"
// import Link from "next/link"
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <>
      <Navbar />
      
      <div className="relative h-[200px] md:h-[300px] flex items-center overflow-hidden px-6 md:px-12">
        {/* Background Image */}
        <Image
          src="/home_banner.webp"
          alt="Banner"
          fill
          priority
          className="object-cover"
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/70" />

        {/* Content Wrapper */}
        <div className="relative z-10 flex w-full items-center justify-between">
          
          <div className="block">
            <h1 className="text-[clamp(2.7rem,6vw,4.5rem)] font-extrabold tracking-wide text-white">
              Show<span className="text-[#00B9B3]">House</span>
            </h1>
            <p className="mt-1 text-sm uppercase tracking-[0.3em] text-gray-300">
              Discover • Watch • Share
            </p>
          </div>

          
          <h2 className="hidden lg:block text-right text-[clamp(1.2rem,4vw,2.1rem)] font-light leading-relaxed text-gray-300">
            See What’s <span className="text-[#00CEC8]">Trending</span>
            <br />
            Decide Your Next <span className="text-[#00CEC8]">BingeWatch</span>
            <br />
            Share Your Collection With{" "}
            <span className="text-[#00CEC8]">Friends</span>
          </h2>
        </div>
      </div>

      {/* <NowPlayingMovies /> */}
      <MoviesByVariant movieType="upcoming" />
      <MoviesByVariant movieType="now_playing" />
      <MoviesByVariant movieType="popular" />

      <h3 className="dark:text-blue-50 text-3xl align-content-center text-slate-800 m-0 ms-3 font-bold">
        Top in Action
      </h3>
      <hr className="border-t-2 border-slate-600 mt-0 mb-1" />

      <MoviesListByGenre pageStart="1" genreId="28" />
      <Footer/>
    </>
  );
}
