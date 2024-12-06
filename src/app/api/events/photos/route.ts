import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

// app/api/events/photos/route.ts
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
  
    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }
  
    try {
      const { data, error } = await supabase
        .from('event_photos')
        .select(`*`)
        .eq('event_id', eventId)
        .order('uploaded_at', { ascending: false });
  
      if (error) throw error;
      return NextResponse.json({ data: data || [] });
    } catch (error) {
      console.error('Error:', error);
      return NextResponse.json({ error: 'Failed to fetch event photos' }, { status: 500 });
    }
  }
  
  export async function POST(request: Request) {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    const eventId = formData.get('eventId') as string;
  
    if (!file || !userId || !eventId) {
      return NextResponse.json({ error: 'File, user ID, and event ID are required' }, { status: 400 });
    }
  
    try {
      const fileName = `${eventId}/${userId}/${Date.now()}.jpg`;
      const buffer = await file.arrayBuffer();
  
      const { error: uploadError } = await supabase.storage
        .from('pictures')
        .upload(`${fileName}`, buffer, {
          contentType: 'image/jpeg',
          upsert: false
        });
  
      if (uploadError) throw uploadError;
  
      const { data: { publicUrl } } = supabase.storage
        .from('pictures')
        .getPublicUrl(fileName);
  
      const { data, error } = await supabase
        .from('event_photos')
        .insert({
          event_id: eventId,
          user_id: userId,
          photo_url: publicUrl
        })
        .select()
        .single();
  
      if (error) throw error;
      return NextResponse.json(data);
    } catch (error) {
      console.error('Error:', error);
      return NextResponse.json({ error: 'Failed to upload photo' }, { status: 500 });
    }
  }
  
  export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const photoId = searchParams.get('photoId');
    const userId = searchParams.get('userId');
  
    if (!photoId || !userId) {
      return NextResponse.json({ error: 'Photo ID and user ID are required' }, { status: 400 });
    }
  
    try {
      const { error } = await supabase
        .from('event_photos')
        .delete()
        .eq('id', photoId)
        .eq('user_id', userId);
  
      if (error) throw error;
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error:', error);
      return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 });
    }
  }