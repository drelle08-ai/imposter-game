import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          phone_number: string;
          username: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          phone_number: string;
          username: string;
          created_at?: string;
        };
        Update: {
          email?: string;
          phone_number?: string;
          username?: string;
        };
      };
      games: {
        Row: {
          id: string;
          game_type: 'imposter' | 'mafia';
          host_id: string;
          status: 'lobby' | 'in_progress' | 'ended';
          invite_code: string;
          max_players: number;
          current_round: number;
          created_at: string;
          started_at: string | null;
        };
      };
      game_players: {
        Row: {
          id: string;
          game_id: string;
          user_id: string | null;
          role: 'imposter' | 'crewmate' | 'unassigned';
          is_alive: boolean;
          voted_for_user_id: string | null;
          joined_at: string;
          guest_name: string | null;
          guest_phone: string | null;
        };
      };
      game_rounds: {
        Row: {
          id: string;
          game_id: string;
          round_number: number;
          phase: 'discussion' | 'voting' | 'results';
          imposter_eliminated: boolean;
          crewmates_won: boolean;
          ended_at: string | null;
        };
      };
    };
  };
};
