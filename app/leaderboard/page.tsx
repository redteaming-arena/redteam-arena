import Header from "@/components/header";
import { LeaderboardTable } from "@/components/leaderboard";
import LeaderboardPodium from "@/components/podium";
import { generateMetadata } from "@/utils/metadata";
import { cookies } from "next/headers";
import google  from '@/public/providers/google.png'
import Image from "next/image";


export const metadata = generateMetadata("leaderboard");

const data = [{
  name: "marion_stiedemann",
  score: "1,671.57",
  avatar: google
},
{
  name: "shannon_kautzer",
  score: "1,671.57",
  avatar: google
},
{
  name: "billy_mraz",
  score: "1,671.57",
  avatar: google
}
];

export default async function Leaderboard() {
  

  return (
    <>
      <Header/>
      <main className="h-screen flex flex-col items-center justify-center">

        <div className="w-full max-w-6xl px-20">
        {/* Title */}
        <h1 className="text-3xl font-bold text-center mb-8">
            {"Leaderboard Rankings/>"}
          </h1>
        <LeaderboardPodium leaders={data}/>


          <LeaderboardTable />
        </div>
      </main>
    </>
  );
}
