import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request) {
  try {
    const { username, score } = await request.json();

    // バリデーション
    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      return NextResponse.json(
        { error: 'ユーザーネームを入力してください' },
        { status: 400 }
      );
    }

    if (typeof score !== 'number' || score < 0 || score > 100) {
      return NextResponse.json(
        { error: 'スコアは0〜100の数値で入力してください' },
        { status: 400 }
      );
    }

    // ユーザーネームの長さ制限
    if (username.trim().length > 50) {
      return NextResponse.json(
        { error: 'ユーザーネームは50文字以内で入力してください' },
        { status: 400 }
      );
    }

    // スコアを保存
    const { data, error } = await supabase
      .from('scores')
      .insert([
        {
          username: username.trim(),
          score: score,
        },
      ])
      .select();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { error: 'スコアの保存に失敗しました', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data: data[0] },
      { status: 200 }
    );
  } catch (error) {
    console.error('Score API error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
