import fs from 'fs';
import path from 'path';

// !!! ここを修正してください !!!
// 例: Next.jsプロジェクトの外にあるPlatformIOプロジェクトフォルダを指定
const TARGET_FILE_PATH = path.join(process.cwd(), '..', '..', '..', 'main.cpp');
// !!! 修正箇所ここまで !!!

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ message: '書き込むコードがありません。' });
  }

  try {
    // UTF-8でファイルを上書き保存
    fs.writeFileSync(TARGET_FILE_PATH, code, 'utf-8');
    
    console.log(`[API] Code written to: ${TARGET_FILE_PATH}`);
    return res.status(200).json({ message: 'ファイルが正常に書き込まれました。' });
    
  } catch (error) {
    console.error('[API Error] File writing failed:', error);
    return res.status(500).json({ 
        message: 'ファイル書き込み中にエラーが発生しました。パスを確認してください。',
        details: error.message
    });
  }
}