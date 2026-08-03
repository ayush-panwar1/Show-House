import { Suspense } from "react";
import Link from "next/link";
import MovieCard from "./movieCard";
import { getCache, setCache } from "@/lib/redis";

type Movie = {
  id: number;
  title: string;
  poster_path: string;
  release_date: string;
  vote_average: string;
};

type TMDBResponse = {
  results: Movie[];
};

async function getMovies({
  pageStart = "1",
  genreId = "28",
}: {
  pageStart: string;
  genreId: string;
}): Promise<TMDBResponse> {

  const totalStart = performance.now();

  const cacheKey = `tmdb:discover:${genreId}:page:${pageStart}`;

  // -----------------------------
  // Redis Lookup
  // -----------------------------
  const redisReadStart = performance.now();

  const cached = await getCache<TMDBResponse>(cacheKey);

  const redisReadTime = performance.now() - redisReadStart;

  if (cached) {
    console.log(`
================== CACHE HIT ==================
Key            : ${cacheKey}
Redis Read     : ${redisReadTime.toFixed(2)} ms
Total Time     : ${(performance.now() - totalStart).toFixed(2)} ms
===============================================
`);

    return cached;
  }

  // -----------------------------
  // Fetch from TMDB
  // -----------------------------
  const URL = `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&primary_release_date.gte=1985-01-01&page=${pageStart}&sort_by=popularity.desc&with_genres=${genreId}`;

  const apiStart = performance.now();

  const res = await fetch(URL, {
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN!.trim()}`,
    },
    cache: "no-store",
  });

  const apiTime = performance.now() - apiStart;

  if (!res.ok) {
    throw new Error("Failed to fetch movies");
  }

  // -----------------------------
  // Parse JSON
  // -----------------------------
  const parseStart = performance.now();

  const data: TMDBResponse = await res.json();

  const parseTime = performance.now() - parseStart;

  // -----------------------------
  // Redis Write
  // -----------------------------
  const redisWriteStart = performance.now();

  await setCache(cacheKey, data, 60 * 60 * 4);

  const redisWriteTime = performance.now() - redisWriteStart;

  console.log(`
================== CACHE MISS =================
Key            : ${cacheKey}
Redis Read     : ${redisReadTime.toFixed(2)} ms
TMDB Fetch     : ${apiTime.toFixed(2)} ms
JSON Parse     : ${parseTime.toFixed(2)} ms
Redis Write    : ${redisWriteTime.toFixed(2)} ms
Total Time     : ${(performance.now() - totalStart).toFixed(2)} ms
===============================================
`);

  return data;
}

export default async function MoviesListByGenre({
  pageStart = "1",
  genreId = "28",
}: {
  pageStart: string;
  genreId: string;
}) {
  const p1 = getMovies({
    pageStart,
    genreId,
  });

  const p2 = getMovies({
    pageStart: String(Number(pageStart) + 1),
    genreId,
  });

  const [data1, data2] = await Promise.all([p1, p2]);

  const movieList = [...data1.results, ...data2.results];

  return (
    <div className="my-2">
      <div className="flex sm:flex-wrap align-center justify-center sm:gap-4">
        <Suspense fallback={"Loading..."}>
          {movieList.map((movie, idx) => (
            <div key={`${movie.id}-${idx}`} className="m-0 p-0">
              <Link href={`/movie/${movie.id}`}>
                <MovieCard
                  id={movie.id}
                  title={movie.title}
                  poster_path={movie.poster_path}
                  release_date={movie.release_date}
                  vote_average={movie.vote_average}
                />
              </Link>
            </div>
          ))}
        </Suspense>
      </div>
    </div>
  );
}