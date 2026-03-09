import Image from "next/image";
import Navbar from "@/components/Navbar";
import CastList from "@/components/CastList";
import MovieCollectionList from "@/components/MovieListByCollection";
import TrailerBtn from "@/components/MovieTrailerBtn";
import Link from "next/link";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

type Genre = {
  id: number;
  name: string;
};

type Cast = {
  name: string;
  profile_path: string;
  character: string;
  known_for_department: string;
};

type MovieDetailResponse = {
  id: string;
  overview: string;
  runtime: number;
  release_date: string;
  poster_path: string;
  genres: Genre[];
  title: string;
  backdrop_path: string;
  original_language: string;
  vote_average: string;
  credits: { cast: Cast[] };
  belongs_to_collection: {
    id: string;
  };
};

async function getMovieDetail(movieId: string): Promise<MovieDetailResponse> {
  // console.log("movieid",movieId)

  const URL = `https://api.themoviedb.org/3/movie/${movieId}?append_to_response=credits`;
  {
    const res = await fetch(URL, {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN?.trim()}`,
      },
      // next: { revalidate: 3600 },
      cache: "no-store",
    });

    if (!res.ok) {
      console.log(res);

      throw new Error("Failed to fetch movie details");
    }

    return res.json();
  }
}

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

function RatingBox({ rating }: { rating: string }) {
  let bgColor = "#01b4e4";
  const r = Number(rating);
  if (r >= 0 && r <= 3) {
    bgColor = "#f37676";
  } else if (r > 3 && r <= 5) {
    bgColor = "#ffe08a";
  } else if (r > 5 && r < 7) {
    bgColor = "#94d3ff";
  } else if (r >= 7 && r <= 9) {
    bgColor = "#94ffb6";
  } else {
    bgColor = "#7afd66";
  }
  const formattedRating = Number(rating).toFixed(1);
  return (
    <>
      <div
        className="h-[50px] w-[50px] px-2 font-bold text-slate-800 text-[16px] flex items-center justify-center rounded-full m-1"
        style={{ backgroundColor: bgColor }}
      >
        <span>{formattedRating}/</span>
        10
      </div>
    </>
  );
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id: movieId } = await params;

  const movie = await getMovieDetail(movieId);
  let genreList = "";
  for (let i = 0; i < movie.genres.length; i++) {
    const gname = movie.genres[i].name;
    genreList += gname;
  }
  return {
    title: `${movie.title} (${movie.release_date.slice(0, 4)})`,
    description: movie.overview.slice(0, 160),
    other: {
      "movie:genre": genreList,
    },

    openGraph: {
      images: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
    },
  };
}

export default async function MovieDetail({ params }: PageProps) {
  const { id: movieId } = await params;
  const detail = await getMovieDetail(movieId);

  const posterURL = `https://image.tmdb.org/t/p/w500${detail.poster_path}`;
  const bannerPath = `https://image.tmdb.org/t/p/original/${detail.backdrop_path}`;
  const genresList = detail.genres;
  const castList = detail.credits.cast;
  let CollectionID = null;
  if (detail.belongs_to_collection != null) {
    CollectionID = detail.belongs_to_collection.id;
  }
  // console.log(castList);

  return (
    <>
      <Navbar />

      <div className="overflow-hidden relative flex flex-row gap-0 m-0">
        {/* 1.bottom banner layer */}
        <Image
          src={bannerPath}
          alt="Banner"
          fill
          className="object-cover  opacity-40 -z-10"
          priority
        />

        {/* 2. The Dark Overlay Layer */}
        <div className="absolute inset-0 bg-black/70 -z-10" />

        {/* 3.main content layer */}
        <div className="flex justify-between items-between flex-col sm:flex-row w-full gap-[40px]">
          <Image
            src={posterURL}
            alt="Movie poster"
            width={350}
            height={525}
            // className="m-3  rounded-lg"
            className="m-3 rounded-lg w-[350px] h-[525px]"
          />
          <div className="flex flex-col  justify-between ">
            {/* text-[min(10vw,35px)] */}
            <div>
              <div className="flex flex-row justify-between mb-0">
                <h3 className="text-[min(10vw,35px)] m-0  text-slate-100 font-bold">
                  {detail.title}
                </h3>
                {/* rating div */}
              </div>

              <ul className="flex m-0 flex-row gap-2  text-slate-300 font-bold">
                <li>{detail.release_date.slice(0, 4)}</li>
                <li>•</li>
                <li>{detail.runtime}m</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-100 text-[25px] mt-3 mb-0">
                Overview
              </h4>
              <p className="text-gray-200 mt-0 text-[20px]">
                {detail.overview}
              </p>
            </div>

            {/* Genre List */}
            <div>
              <h4 className="font-bold text-slate-100 text-[25px] mt-3 mb-0">
                Related Genre
              </h4>
              <div className="flex felx-row m-2 gap-2 flex-wrap">
                {genresList.map((g, i) => (
                  <Link
                    key={i}
                    href={`/movie/genre/${g.id}/${g.name.toLowerCase().replace(/\s+/g, "-")}?page=1`}
                  >
                    <div className="custom_pill_box">{g.name}</div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-between me-2">
              <div className="flex gap-4 items-center mb-3">
                <h4 className="font-bold text-slate-100 text-[25px] mt-3 mb-0">
                  Rating
                </h4>
                <RatingBox rating={detail.vote_average} />
              </div>

              <TrailerBtn movieId={detail.id} />
            </div>
          </div>
        </div>
      </div>

      <CastList cast={castList} />
      {CollectionID && <MovieCollectionList CollectionID={CollectionID} />}
      <Footer />
    </>
  );
}
