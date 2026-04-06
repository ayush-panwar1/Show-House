// app/api/search/route.ts
import { NextRequest } from "next/server";
import Tree from "../../../components/WordPredictor";

const tree = new Tree();

type movie = {
  id: number;
  title: string;
};

type tmdb = {
  results: movie[];
};

async function searchMovies(query: string, page = "1"): Promise<tmdb | null> {
  const encodedQuery = encodeURIComponent(query);

  const URL = `https://api.themoviedb.org/3/search/movie?query=${encodedQuery}&include_adult=false&language=en-US&page=${page}&region=IN`;

  const res = await fetch(URL, {
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    return null;
  }

  return res.json();
}

async function MovieFromTMDB(q: string,page: string){

   const data = await searchMovies(q, page);
    console.log(data);

    if (!data || !data.results || data.results.length === 0) {
      return Response.json({ movies: [] });
    }

    // send unique movie list to front , only 10 reponses:
    const unique = new Map<number, movie>();

    for (const m of data.results) {
      if (!unique.has(m.id)) {
        unique.set(m.id, { id: m.id, title: m.title });
      }
    }

    const movieList = Array.from(unique.values()).slice(0, 10);
    console.log(movieList)
    return Response.json({
      movies: movieList,
    });

}

export async function GET(req: NextRequest) {
  // if single word use local rearch else call api:

  let q = req.nextUrl.searchParams.get("q") || "";
  const wordCount = q.trim().split(/\s+/).filter(Boolean).length;

  if(wordCount >1){
    const page = req.nextUrl.searchParams.get("page") || "1";

    if (!q) {
      return Response.json({ error: "Missing query" }, { status: 400 });
    }
    return await MovieFromTMDB(q,page);
    // const data = await searchMovies(q, page);
    // console.log(data);

    // if (!data || !data.results || data.results.length === 0) {
    //   return Response.json({ movies: [] });
    // }

    // // send unique movie list to front , only 10 reponses:
    // const unique = new Map<number, movie>();

    // for (const m of data.results) {
    //   if (!unique.has(m.id)) {
    //     unique.set(m.id, { id: m.id, title: m.title });
    //   }
    // }

    // const movieList = Array.from(unique.values()).slice(0, 10);
    // console.log(movieList)
    // return Response.json({
    //   movies: movieList,
    // });
  }

  else{
    q = q.trim().toLowerCase();

    const movieList = tree.PredictWord(q);
    if( movieList.length ==0){
      const page = req.nextUrl.searchParams.get("page") || "1";
      return await MovieFromTMDB(q,page);
    }
    return Response.json({
      movies: movieList.slice(0, 10),
    });
  }
}
