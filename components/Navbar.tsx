import Link from "next/link";
import Image from "next/image";
import SearchBox from "./SearchBox";
import Signup from "./Signup";
import ThemeToggle from "./ThemeButton";

export default function Navbar() {
  return (
    <>
      <div className="bg-[#01b4e4] dark:bg-[#100953]  text-gray-100 dark:text-blue-100 py-2 px-1 w-auto">
        <nav className="flex flex-row items-center justify-between">
          {/*Brand Logo */}
          <Link href="/">
            <div className="flex items-center justify-center h-[30px] w-[100px] bg-[#01b4e4]  rounded-full">
              <Image
                src="/brand_logo.svg"
                alt="Brand Logo"
                width={200}
                height={40}
                style={{ height: "40px", width: "200px" }}
                // className="object-contain"
              ></Image>
            </div>
          </Link>

          {/* <div className="me-[500px] w-[500px]">
                    
                </div> */}

          <SearchBox />
          <div className="flex gap-2 items-center">
            <Signup />
            <ThemeToggle />
          </div>

          {/* Menu */}
          {/* <ul className=" hidden sm:inline-flex flex flex-row items-center  font-bold  gap-[40px] justify-evenly  text-[min(10vw,25px)]">
                    <li>Movies</li>
                    <li>Serials</li>
                    <li>People</li>
                    <li>About</li>
                    <li>Login</li>
                </ul> */}
        </nav>
      </div>
    </>
  );
}
