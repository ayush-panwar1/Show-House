import MoviesListByGenre from "@/components/MoviesListByGenre";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import Footer from "@/components/Footer";
import Image from "next/image";
type PageProps = {
  params: Promise<{
    id: string;
    genre_name: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
};

function ChangePage({
  pageNo = "1",
  id,
  genre,
}: {
  pageNo?: string;
  id: string;
  genre: string;
}) {
  const currentPage = Number(pageNo);
  const baseUrl = `/movie/genre/${id}/${genre.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="bg-[#01b4e4] dark:bg-[#100953] flex  flex-row justify-center gap-[40px] p-2">
      {/* Prevent going below page 1 */}
      {currentPage > 1 ? (
        <Link
          className="custom_pill_box"
          href={`${baseUrl}?page=${currentPage - 1}`}
        >
          <Image
            src="/back-arrow.svg"
            alt="Brand Logo"
            width={30}
            height={30}
            style={{ height: "30px", width: "30px" }}
            // className="object-contain"
          ></Image>
          Page {currentPage - 1}
        </Link>
      ) : (
        <div />
      )}

      {currentPage <= 5 ? (
        <Link
          className="custom_pill_box"
          href={`${baseUrl}?page=${currentPage + 1}`}
        >
          Page {currentPage + 1}
          <Image
            src="/forward-arrow.svg"
            alt="Brand Logo"
            width={30}
            height={30}
            style={{ height: "30px", width: "30px" }}
            
          ></Image>
        </Link>
      ) : (
        <></>
      )}
    </div>
  );
}

export default async function MovieByGenre({
  params,
  searchParams,
}: PageProps) {
  // const movieId = params.id;
  const { id, genre_name } = await params;
  const { page } = await searchParams;
  let pageNumber = page || "1";
  if (Number(pageNumber) > 5) pageNumber = "5";
  // let name ="";

  const name = genre_name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  return (
    <>
      <Navbar />
      
      <div className="flex flex-col gap-2 m-0">
        <h2 className="ms-2 pb-0 font-bold text-slate-800 dark:text-blue-100 text-[25px] mt-4 mb-0">
          Top in {name}
        </h2>
        
        <hr className="border-t-2 pt-0 border-slate-600 mt-0 mb-1 mt-0" />

        <MoviesListByGenre
          genreId={id}
          pageStart={String(2 * Number(pageNumber) - 1)}
        />
      </div>
      <ChangePage pageNo={page} id={id} genre={genre_name} />
      <Footer />
    </>
  );
}
