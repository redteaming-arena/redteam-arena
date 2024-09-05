import { useRouter } from 'next/router';
import { exampleGames } from '@/data/games';

const GamePage = () => {
  const router = useRouter();
  const { gameId } = router.query;

  const game = exampleGames.find((game) => game.id === gameId);

  if (!game) {
    return <div>Game not found</div>;
  }

  return (
    <div>
      <h1>{game.title}</h1>
      <p>{game.description}</p>
      {/* Add other game details here */}
    </div>
  );
};

export default GamePage;