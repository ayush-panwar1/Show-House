import Link from "next/link";
// import ThemeToggle from "./ThemeButton";

export default function Footer() {
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
    { id: 37, name: "Western" },
  ];

  return (
    <footer className="bg-neutral-800 text-neutral-300 h-auto m-0 pt-6">
      <p>Explore All Genre</p>
      <hr></hr>
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

    

      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col  md:flex-row justify-between items-center gap-4">
        <p className="text-sm text-neutral-400">
          © {new Date().getFullYear()} Show House
        </p>

        <div className="flex items-center gap-6 text-sm">
          <Link href="/" className="hover:text-white transition">
            Home
          </Link>

          <Link href="/privacypolicy" className="hover:text-white transition">
            Privacy Policy
          </Link>

          <Link href="/termsofservice" className="hover:text-white transition">
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}
