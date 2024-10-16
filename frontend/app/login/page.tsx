
import { LoginCard } from "@/components/cards/login";

export default async function Login(){

    return (<div className="font-sans flex flex-col items-center justify-center min-h-screen ">
    <div className="-z-10 absolute inset-0 h-full w-full bg-zinc-950/80 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
    <div className="text-white text-4xl font-bold p-5 rounded-xl shadow-xl -mt-32">
        {"/>"}
  </div>
    <div className="w-72 max-w-md ">
        <LoginCard/>
    </div>
  </div>)
}