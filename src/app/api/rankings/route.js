import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 50; // デフォルト50件

    // スコアを降順で取得
    const { data, error } = await supabase
      .from('scores')
      .select('*')
      .order('score', { ascending: false })
      .order('created_at', { ascending: true }) // 同点の場合は早い方が上位
      .limit(Math.min(limit, 100)); // 最大100件まで

    if (error) {
      console.error('Supabase select error:', error);
      return NextResponse.json(
        { error: 'ランキングの取得に失敗しました', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, rankings: data },
      { status: 200 }
    );
  } catch (error) {
    console.error('Rankings API error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
