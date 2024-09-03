"use server"
import GameCard from '@/components/cards/game'
import Header from '@/components/header'
import ComingSoon from '@/pages/coming-soon'
import { games_list } from '@/services/games'

export default async function Games(params:any) {

    const games = (await games_list()).data
    console.log(games)

    return (
     <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow mt-20">
      </main>
    </div>)
}