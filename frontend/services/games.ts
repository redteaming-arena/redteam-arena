'use server'
import { apiCall, ApiResponse } from './utils';
import { getCookie } from 'cookies-next';
import { cookies } from 'next/headers';
import {Game} from '@/data/games';

export async function games_list(): Promise<ApiResponse<Game[]>> {
    return apiCall<any>(
      `${process.env.BASE_URL}/api/game/list`,
      'GET',
      { 'Content-Type': 'application/json' }
    );
  }

  export async function get_game(game_id : number): Promise<ApiResponse<Game>> {
    return apiCall<any>(
      `${process.env.BASE_URL}/api/game/${game_id}`,
      'GET',
      { 'Content-Type': 'application/json' }
    );
  }

  export async function create_game_session(game_id: number) {
    try {
      // Fetch the games list
      const games_response = await games_list();
      
      if (!games_response.success) {
        throw new Error('Failed to fetch games list');
      }
  
      // Find the selected game
      const selected_game = games_response.data?.find(game => game.id === game_id);
      if (!selected_game) {
        throw new Error('Selected game not found');
      }
  
      console.log(cookies().get("ra_token_verification"), getCookie("ra_token_verification"))
      // Create a new game session
      const session_response = await apiCall<string>(
        `${process.env.BASE_URL}/api/game/session?game_id=${game_id}`,
        'POST',
        { 'Content-Type': 'application/json',
          'Authorization': `Bearer ${cookies().get("ra_token_verification")?.value}`
         },
        "no-store",
      );
  
      console.log(session_response)
      if (!session_response.success || !session_response.data) {
        throw new Error('Failed to create game session');
      }


      // Redirect to the game session
      
      return session_response
    } catch (error) {
      console.error('Error creating game session:', error);
      // Handle the error appropriately, maybe redirect to an error page
      return { success : false, message : "Error creating game session", data : "/error" }
    }
  }

