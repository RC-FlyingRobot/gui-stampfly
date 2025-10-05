import fs from 'fs';
import path from 'path';

// 使用方法:
// - 開発環境で別フォルダに書き込みたい場合は環境変数 TARGET_FILE_PATH を絶対パスで設定してください。
//   例: TARGET_FILE_PATH=/Users/you/PlatformIOProject/src/main.cpp
// - 指定がない場合はプロジェクトルート直下の main.cpp に書き込みます（安全のためにデフォルトはプロジェクト内）。
const TARGET_FILE_PATH = process.env.TARGET_FILE_PATH || path.join(process.cwd(), 'main.cpp');

export async function POST(req) {
  try {
    const body = await req.json();
    const { code } = body || {};

    if (!code) {
      return new Response(JSON.stringify({ message: '書き込むコードがありません。' }), { status: 400 });
    }

    // ディレクトリが存在しない場合は作成する
    const dir = path.dirname(TARGET_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(TARGET_FILE_PATH, code, 'utf-8');
    console.log(`[API] Code written to: ${TARGET_FILE_PATH}`);
    return new Response(JSON.stringify({ message: 'ファイルが正常に書き込まれました。' }), { status: 200 });
  } catch (error) {
    console.error('[API Error] File writing failed:', error);
    return new Response(
      JSON.stringify({
        message: 'ファイル書き込み中にエラーが発生しました。パスを確認してください。',
        details: error?.message,
      }),
      { status: 500 }
    );
  }
}
