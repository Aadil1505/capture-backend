import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const { name, userId } = await request.json();
  
    if (!name || !userId) {
      return NextResponse.json({ error: 'Name and user ID are required' }, { status: 400 });
    }
  
    try {
      const event_code = Math.random().toString(36).substring(2, 8).toUpperCase();
  
      const { data, error } = await supabase
        .from('events')
        .insert({
          name,
          event_code,
          created_by: userId,
          status: 'active'
        })
        .select()
        .single();
  
      if (error) throw error;
      return NextResponse.json(data);
    } catch (error) {
      console.error('Error:', error);
      return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
    }
  }