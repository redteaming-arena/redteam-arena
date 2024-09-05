import { useRouter } from "next/router";

export default function GameDetails() {
  const router = useRouter();
  const { gameId } = router.query;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Game {gameId} - Not available</h1>
        <p className="text-gray-400 mt-4">This game is currently unavailable. Please check back later.</p>
      </div>
    </div>
  );
}
