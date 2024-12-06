import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const { userId, updates } = await request.json();

  if (!userId || !updates) {
    return NextResponse.json({ error: 'User ID and updates are required' }, { status: 400 });
  }

  try {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}