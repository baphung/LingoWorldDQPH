import { NextResponse } from 'next/server';
import { getSupabase } from '../../../lib/supabase';

export async function GET() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('languages')
      .select('slug, published')
      .eq('published', true);

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          supabase: true,
          error: error.message || 'Supabase query failed',
          code: error.code || null,
          details: error.details || null,
          hint: error.hint || null,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      supabase: true,
      languages: data?.length ?? 0,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        supabase: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
