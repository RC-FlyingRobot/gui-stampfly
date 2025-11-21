'use client';

import { useState, useEffect } from 'react';
import styles from './RankingModal.module.css';

export default function RankingModal({ isOpen, onClose }) {
  const [rankings, setRankings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchRankings();
    }
  }, [isOpen]);

  const fetchRankings = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/rankings?limit=50');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'ランキングの取得に失敗しました');
      }

      setRankings(data.rankings);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchRankings();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>🏆 ランキング</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        {error && (
          <div className={styles.errorContainer}>
            <p className={styles.error}>{error}</p>
            <button className={styles.retryButton} onClick={handleRefresh}>
              再試行
            </button>
          </div>
        )}

        {isLoading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>読み込み中...</p>
          </div>
        ) : (
          <>
            {rankings.length === 0 ? (
              <div className={styles.emptyState}>
                <p>まだランキングデータがありません</p>
                <p className={styles.emptySubtext}>最初のスコアを記録してみましょう！</p>
              </div>
            ) : (
              <>
                <div className={styles.refreshContainer}>
                  <button className={styles.refreshButton} onClick={handleRefresh}>
                    🔄 更新
                  </button>
                </div>
                <div className={styles.rankingList}>
                  {rankings.map((entry, index) => (
                    <div
                      key={entry.id}
                      className={`${styles.rankingItem} ${
                        index === 0 ? styles.first :
                        index === 1 ? styles.second :
                        index === 2 ? styles.third : ''
                      }`}
                    >
                      <div className={styles.rank}>
                        {index === 0 ? '🥇' :
                         index === 1 ? '🥈' :
                         index === 2 ? '🥉' :
                         `${index + 1}`}
                      </div>
                      <div className={styles.username}>{entry.username}</div>
                      <div className={styles.score}>{entry.score} 点</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
