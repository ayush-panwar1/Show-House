// import { stringify } from "querystring";
import { Suspense } from "react";
import MovieCard from "./movieCard";
import Link from "next/link"
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


async function getMovies({pageStart="1", genreId="28"}: {pageStart: string; genreId:string}): Promise<TMDBResponse> {
  // const URL =
  //   "https://api.themoviedb.org/3/movie/popular?language=en-US&page=1";

  const URL = `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&primary_release_date.gte=1985-01-01&page=${pageStart}&sort_by=popularity.desc&with_genres=${genreId}`;

    
  // const URL =   "https://api.themoviedb.org/3/discover/movie?with_genres=28";
  // console.log("TOKEN EXISTS:", process.env.TMDB_ACCESS_TOKEN);
  if (!process.env.TMDB_ACCESS_TOKEN) {
    throw new Error("TMDB_ACCESS_TOKEN is missing");
  }

  const res = await fetch(URL, {
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN?.trim()}`,
    },
    next: { revalidate: 259200 }, // caching 
  });

  if (!res.ok) {
    console.log()
    throw new Error("Failed to fetch movies");
  }

  return (res.json());
}

export default async function MoviesListByGenre({pageStart="1", genreId="28"}:{pageStart:string; genreId:string}) {
  // let movieList: Movie[] =[];

  // for(let i =0; i<2 ;i++){
  //   const movieData= await getMovies({pageStart: String(Number(pageStart)+i), genreId:genreId});
  //   movieList = [...movieList, ...movieData.results]
  // }

  const p1 = getMovies({pageStart, genreId});
  const p2 = getMovies({pageStart: String(Number(pageStart) + 1), genreId});

  // Fetch both pages at the exact same time
  const [data1, data2] = await Promise.all([p1, p2]);
  const movieList = [...data1.results, ...data2.results];
 

  return (
    <div className="my-2">
    {/* <h3 className="dark:text-blue-50 text-3xl align-content-center text-slate-800 m-0 font-bold">Top in Genre</h3> */}
    <div className="flex  sm:flex-wrap align-center justify-center sm:gap-4 ">
        <Suspense fallback={"Loading..."}>
      {movieList.map((movie,idx) => (
        <div key={movie.id+ "-" +idx} className="m-0 p-0">
            <Link href={`/movie/${movie.id}`}  >
              <MovieCard vote_average={movie.vote_average} id={movie.id} title={movie.title} poster_path={movie.poster_path} release_date={movie.release_date}/>

            </Link>
        </div>
        
      ))}
      </Suspense>
    </div>
    </div>
  );
}
