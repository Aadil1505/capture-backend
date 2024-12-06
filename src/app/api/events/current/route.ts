// app/api/events/current/route.ts
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('event_participants')
      .select(`
        *,
        event:events(*)
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error) throw error;
    
    if (!data) {
      return NextResponse.json({ event: null });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch current event' }, { status: 500 });
  }
}