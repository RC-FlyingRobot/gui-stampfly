"use client"
import dynamic from 'next/dynamic';

// SSRを無効にしてクライアントサイドでのみロードする
const StampFlyBlockly = dynamic(
  () => import('../components/StampFlyBlockly'),
  { ssr: false }
);

export default function ProgrammingPage() {
  return (
    <div style={{ height: '100vh', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* <h1 style={{ margin: 0, padding: '15px 20px', fontSize: '1.5em', flexShrink: 0, borderBottom: '2px solid #ccc' }}>🚁 StampFly プログラミング チャレンジ！</h1> */}
      {/* <h1 style={{ color: 'red', height: '24px', fontSize: '24px' }}>🚁 ドローンプログラミングチャレンジ！</h1> */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <StampFlyBlockly />
      </div>
    </div>
  );
}