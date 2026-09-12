import { NextResponse } from 'next/server';
import { getSupabase } from '../../../lib/supabase';

export async function GET() {
  try {
    const supabase = getSupabase();
    const { count, error } = await supabase.from('languages').select('*', { count: 'exact', head: true });
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, supabase: true, languages: count ?? 0 });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
