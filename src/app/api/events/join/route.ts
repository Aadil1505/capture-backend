import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

// app/api/events/join/route.ts
export async function POST(request: Request) {
    const { eventCode, userId } = await request.json();
  
    if (!eventCode || !userId) {
      return NextResponse.json({ error: 'Event code and user ID are required' }, { status: 400 });
    }
  
    try {
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('id')
        .eq('event_code', eventCode)
        .single();
  
      if (eventError || !event) {
        throw new Error('Event not found');
      }
  
      // Set any existing active participation to inactive
      await supabase
        .from('event_participants')
        .update({ status: 'inactive' })
        .eq('user_id', userId)
        .eq('status', 'active');
  
      // Check if user was previously in this event
      const { data: existingParticipant } = await supabase
        .from('event_participants')
        .select('*')
        .eq('event_id', event.id)
        .eq('user_id', userId)
        .single();
  
      if (existingParticipant) {
        const { error } = await supabase
          .from('event_participants')
          .update({ status: 'active' })
          .eq('event_id', event.id)
          .eq('user_id', userId);
  
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('event_participants')
          .insert({
            event_id: event.id,
            user_id: userId,
            status: 'active'
          });
  
        if (error) throw error;
      }
  
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error:', error);
      return NextResponse.json({ error: 'Failed to join event' }, { status: 500 });
    }
  }