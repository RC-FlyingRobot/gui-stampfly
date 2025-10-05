"use client"
import dynamic from 'next/dynamic';

// SSRを無効にしてクライアントサイドでのみロードする
const StampFlyBlockly = dynamic(
  () => import('../components/StampFlyBlockly'),
  { ssr: false }
);

export default function ProgrammingPage() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>🚁 StampFly プログラミング チャレンジ！</h1>
      <p>ブロックを組み合わせて、ドローンの動きをプログラミングしよう！</p>
      <StampFlyBlockly />
    </div>
  );
}