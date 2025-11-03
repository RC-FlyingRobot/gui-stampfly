import fs from 'fs';
import path from 'path';

const BASE_DIR = process.env.WRITE_BASE_DIR || path.join(process.cwd(), 'firmware');

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const filename = searchParams.get('filename');

    if (!filename || typeof filename !== 'string') {
      return new Response(
        JSON.stringify({ message: '読み込むファイル名 (filename) を相対パスで指定してください。' }),
        { status: 400 }
      );
    }

    // ベースディレクトリ以下に限定
    const targetPath = path.resolve(BASE_DIR, filename);
    const resolvedBase = path.resolve(BASE_DIR);

    if (!targetPath.startsWith(resolvedBase + path.sep) && targetPath !== resolvedBase) {
      console.error('[API Error] Attempted path traversal or outside BASE_DIR:', targetPath);
      return new Response(
        JSON.stringify({ message: '不正なファイルパスです。' }),
        { status: 400 }
      );
    }

    // ファイル存在確認
    if (!fs.existsSync(targetPath)) {
      return new Response(
        JSON.stringify({ message: 'ファイルが存在しません。', path: targetPath }),
        { status: 404 }
      );
    }

    const content = fs.readFileSync(targetPath, 'utf-8');
    console.log(`[API] File read from: ${targetPath}`);
    
    return new Response(
      JSON.stringify({ content, path: targetPath }),
      { status: 200 }
    );
  } catch (error) {
    console.error('[API Error] File reading failed:', error);
    return new Response(
      JSON.stringify({
        message: 'ファイル読み込み中にエラーが発生しました。',
        details: error?.message,
      }),
      { status: 500 }
    );
  }
}
