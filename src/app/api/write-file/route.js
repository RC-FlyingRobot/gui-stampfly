import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

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

    const targetPath = path.resolve(BASE_DIR, filename);
    const resolvedBase = path.resolve(BASE_DIR);

    if (!targetPath.startsWith(resolvedBase + path.sep) && targetPath !== resolvedBase) {
      console.error('[API Error] Attempted path traversal or outside BASE_DIR:', targetPath);
      return new Response(JSON.stringify({ message: '不正なファイルパスです。許可されているディレクトリ内の相対パスを指定してください。' }), { status: 400 });
    }

    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(targetPath, code, 'utf-8');
    console.log(`[API] Code written to: ${targetPath}`);

    // ファイル書き込み後にpio run --target uploadを実行
    try {
      // プロジェクトディレクトリ（platformio.iniがあるディレクトリ）を特定
      const projectDir = path.dirname(targetPath);
      let pioDir = projectDir;
      
      // platformio.iniを探して上位ディレクトリを辿る
      while (pioDir.startsWith(resolvedBase)) {
        const pioIniPath = path.join(pioDir, 'platformio.ini');
        if (fs.existsSync(pioIniPath)) {
          break;
        }
        const parentDir = path.dirname(pioDir);
        if (parentDir === pioDir) break; // ルートに到達
        pioDir = parentDir;
      }

      console.log(`[API] Running pio run --target upload in: ${pioDir}`);
      const { stdout, stderr } = await execAsync('pio run --target upload', {
        cwd: pioDir,
        timeout: 120000, // 2分のタイムアウト
      });

      console.log('[API] PIO Upload stdout:', stdout);
      if (stderr) {
        console.warn('[API] PIO Upload stderr:', stderr);
      }

      return new Response(
        JSON.stringify({
          message: 'ファイルが正常に書き込まれ、アップロードが完了しました。',
          path: targetPath,
          baseDir: resolvedBase,
          uploadOutput: stdout,
          uploadError: stderr || null,
        }),
        { status: 200 }
      );
    } catch (uploadError) {
      console.error('[API Error] PIO upload failed:', uploadError);
      return new Response(
        JSON.stringify({
          message: 'ファイルは書き込まれましたが、アップロードに失敗しました。',
          path: targetPath,
          baseDir: resolvedBase,
          uploadError: uploadError?.message,
          uploadStdout: uploadError?.stdout || null,
          uploadStderr: uploadError?.stderr || null,
        }),
        { status: 207 } // Multi-Status: 部分的成功
      );
    }
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
