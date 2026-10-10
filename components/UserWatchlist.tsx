import Link from "next/link";
import { cookies } from "next/headers";
import MovieCard from "./movieCard";
import { db } from "@/lib/database";
import { verifyToken } from "@/lib/jwtToken";

type Movie = {
  id: number;
  title: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
};

export default async function WatchlistMovieList() {
  const cookieStore = await cookies();
  const token = cookieStore.get("userToken")?.value;
  const payload = token ? verifyToken(token) : null;

  if (!payload?.userId) {
    return (
      <section className="px-4 py-12 text-center text-slate-100">
        <h2 className="text-2xl font-bold">Your Watchlist</h2>
        <p className="mt-2 text-slate-400">
          Please log in to view your saved movies.
        </p>
      </section>
    );
  }

  const result = await db.query(
    `SELECT movie_id, title
     FROM public.watchlist
     JOIN public.movies USING (movie_id)
     WHERE user_id = $1
     ORDER BY added_at DESC`,
    [payload.userId]
  );

  if (result.rows.length === 0) {
    return (
      <section className="px-4 py-12 text-center text-slate-100">
        <h2 className="text-2xl font-bold">Your Watchlist is Empty</h2>
        <p className="mt-2 text-slate-400">
          Add movies using Watch Later to see them here.
        </p>
        <Link
          href="/"
          className="mt-5 inline-block rounded-full bg-slate-100 px-5 py-2 font-bold text-slate-900 hover:bg-slate-700 hover:text-white"
        >
          Explore Movies
        </Link>
      </section>
    );
  }

  const tokenValue = process.env.TMDB_ACCESS_TOKEN?.trim();

  if (!tokenValue) {
    throw new Error("TMDB_ACCESS_TOKEN is not configured.");
  }

  const movies = await Promise.all(
    result.rows.map(async (row): Promise<Movie | null> => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/${row.movie_id}`,
          {
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${tokenValue}`,
            },
            next: { revalidate: 3600 },
          }
        );

        if (!response.ok) {
          console.error(`TMDB lookup failed for movie ${row.movie_id}`);
          return null;
        }

        const data = await response.json();

        return {
          id: Number(row.movie_id),
          title: data.title ?? row.title,
          poster_path: data.poster_path ?? "",
          release_date: data.release_date ?? "",
          vote_average: data.vote_average ?? 0,
        };
      } catch (error) {
        console.error(`Failed to fetch movie ${row.movie_id}:`, error);
        return null;
      }
    })
  );

  const validMovies = movies.filter(
    (movie): movie is Movie => movie !== null
  );

  return (
    <section className="px-3 py-6 text-slate-100 sm:px-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-4xl font-semibold tracking-tight text-[#F54927]">My Watchlist</h2>
        <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">
          {result.rows.length} movies
        </span>
      </div>

      <hr className="mb-3 mt-0 border-t-2 border-slate-600" />

      {validMovies.length === 0 ? (
        <p className="py-8 text-center text-slate-400">
          Movie details are temporarily unavailable.
        </p>
      ) : (
        <div className="flex flex-row flex-nowrap justify-start gap-2 overflow-x-auto pb-4">
          {validMovies.map((movie) => (
            <Link
              key={movie.id}
              href={`/movie/${movie.id}`}
              className="shrink-0"
            >
              <MovieCard
                id={movie.id}
                title={movie.title}
                poster_path={movie.poster_path}
                release_date={movie.release_date}
                vote_average={String(movie.vote_average)}
              />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
