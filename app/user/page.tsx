import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HomeClientPage from "./UserClientPage";
import WatchlistMovieList from "@/components/UserWatchlist";

type PageProps = {
  searchParams: Promise<{
    status?: string;
  }>;
};

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-white text-gray-900 dark:bg-slate-800 dark:text-gray-100">
        <HomeClientPage status={params.status} />

        {params.status !== "fail" && <WatchlistMovieList />}
      </main>

      <Footer />
    </>
  );
}