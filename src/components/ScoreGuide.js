'use client';

import styles from './ScoreGuide.module.css';

export default function ScoreGuide() {
  const scoreItems = [
    { icon: '🤍', label: 'しろエリア', points: 30 },
    { icon: '🌊', label: 'ブルーシート', points: 20 },
    { icon: '🔵', label: 'あおエリア', points: 10 },
  ];

  return (
    <div className={styles.scoreGuide}>
      <h3 className={styles.title}>📊 とくてんひょう</h3>
      <div className={styles.scoreList}>
        {scoreItems.map((item, index) => (
          <div key={index} className={styles.scoreItem}>
            {/* <span className={styles.icon}>{item.icon}</span> */}
            <span className={styles.label}>{item.label}</span>
            <span className={styles.points}>{item.points}てん</span>
          </div>
        ))}
      </div>
    </div>
  );
}
