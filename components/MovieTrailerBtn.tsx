"use client"
import Image from "next/image"
async function handleClick(movieId: string) {
    const res = await fetch(`/api/video?movieId=${movieId}`)
    const data = await res.json();
    // console.log(data);

    if (data.link) {
        window.open(data.link, "_blank");
    } else {
        alert("Trailer not available");
    }

}

export default function TrailerBtn({ movieId }: { movieId: string }) {
    return <>
        <button type="button" onClick={() => handleClick(movieId)}
            className=" border-0 text-slate-800 mb-3 flex font-bold flex-row gap-2 align-center justify-center rounded-full cursor-pointer hover:bg-slate-800 hover:text-slate-100 h-[38px] w-[110px] p-2 bg-slate-100">
            <div className="flex flex-row p-0 mb-1"> Trailer</div>
                        {/* bg-slate-100 text-slate-800 */}
            <Image src='/youtube-logo.png' height={20} width={35} alt="logo"></Image>

        </button>


    </>
}
