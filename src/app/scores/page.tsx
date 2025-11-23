import React from 'react';
import ScoreGuide from '@/components/ScoreGuide';
import RankingModal from '@/components/RankingModal';

export default function Scores() {
  return (
    <main style={{ minHeight: '100vh', padding: '24px 12px', backgroundColor: '#f5f7fb' }}>
        <div className="title">
            <h1 style={{ fontSize: '10rem', textAlign: 'center', width: '100%' }}>ドローン着陸ゲーム</h1>
        </div>
      <div style={{ maxWidth: '960px', margin: '0 auto 16px', textAlign: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#222' }}>スコア</h1>
      </div>

      <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div
          style={{
            backgroundColor: '#fff',
            borderRadius: '16px',
            boxShadow: '0 6px 24px rgba(0, 0, 0, 0.08)',
            border: '1px solid #e8e8e8',
            padding: '12px',
          }}
        >
          <ScoreGuide />
        </div>

        <RankingModal />
      </div>
    </main>
  )
}
