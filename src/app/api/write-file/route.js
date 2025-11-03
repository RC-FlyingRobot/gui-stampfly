import fs from 'fs';
import path from 'path';

// セキュアなベースディレクトリ: リポジトリ内の `firmware` フォルダを想定
// クライアントからは相対パス (例: "M5Stampfly/src/flight_control.cpp") を渡してください。
// 環境変数で別のベースフォルダを指定したい場合は WRITE_BASE_DIR を設定してください。
const BASE_DIR = process.env.WRITE_BASE_DIR || path.join(process.cwd(), 'firmware');

export async function POST(req) {
  try {
    const body = await req.json();
    const { code, filename } = body || {};

    if (!code) {
      return new Response(JSON.stringify({ message: '書き込むコードがありません。' }), { status: 400 });
    }

    if (!filename || typeof filename !== 'string') {
      return new Response(
        JSON.stringify({ message: '書き込むファイル名 (filename) を相対パスで指定してください。例: "M5Stampfly/src/flight_control.cpp"' }),
        { status: 400 }
      );
    }

    // ベースディレクトリ以下に限定してパス横取りを防止
    const targetPath = path.resolve(BASE_DIR, filename);
    const resolvedBase = path.resolve(BASE_DIR);

    if (!targetPath.startsWith(resolvedBase + path.sep) && targetPath !== resolvedBase) {
      console.error('[API Error] Attempted path traversal or outside BASE_DIR:', targetPath);
      return new Response(JSON.stringify({ message: '不正なファイルパスです。許可されているディレクトリ内の相対パスを指定してください。' }), { status: 400 });
    }

    // 必要ならディレクトリを作成
    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(targetPath, code, 'utf-8');
    console.log(`[API] Code written to: ${targetPath}`);
    return new Response(JSON.stringify({ message: 'ファイルが正常に書き込まれました。', path: targetPath, baseDir: resolvedBase }), { status: 200 });
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
