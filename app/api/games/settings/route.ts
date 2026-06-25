import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: NextRequest) {
  try {
    const { gameId, use_keyword, give_hints_to_imposter } = await req.json();

    if (!gameId) {
      return NextResponse.json({ error: 'Game ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('games')
      .update({
        use_keyword: use_keyword ?? false,
        give_hints_to_imposter: give_hints_to_imposter ?? false,
      })
      .eq('id', gameId);

    if (error) {
      return NextResponse.json({ error: 'Failed to update game settings' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Game settings updated' });
  } catch (error) {
    console.error('Error updating game settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
