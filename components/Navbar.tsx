import Link from "next/link";
import Image from "next/image";
import SearchBox from "./SearchBox";

import ThemeToggle from "./ThemeButton";

import UserLogin from "./UserLogin";
export default function Navbar() {
  return (
    <>
      <div className="bg-[#00CEC8]   text-gray-100 dark:text-blue-100 py-2 px-1 w-auto">
        <nav className="flex flex-row  items-center justify-between">
          {/*Brand Logo */}

          <div className="hidden md:block  bg-[#00CEC8]  rounded-full">
            <Link href="/">
              <Image
                src="/brand_logo.svg"
                alt="Brand Logo"
                width={100}
                height={40}
                style={{ height: "40px", width: "100px" }}
              // className="object-contain"
              ></Image>
            </Link>
          </div>

          <SearchBox />
          <div className="flex gap-4 items-center">

            <UserLogin />

            <ThemeToggle />

          </div>


        </nav>
      </div>
    </>
  );
}
