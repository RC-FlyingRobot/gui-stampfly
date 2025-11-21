'use client';

import { useState } from 'react';
import styles from './ScoreInputModal.module.css';

export default function ScoreInputModal({ isOpen, onClose, onSubmit }) {
  const [step, setStep] = useState(1); // 1: ユーザーネーム入力, 2: スコア入力
  const [username, setUsername] = useState('');
  const [score, setScore] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleUsernameSubmit = (e) => {
    e.preventDefault();
    if (username.trim().length === 0) {
      setError('ユーザーネームを入力してください');
      return;
    }
    if (username.trim().length > 50) {
      setError('ユーザーネームは50文字以内で入力してください');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleScoreSubmit = async (e) => {
    e.preventDefault();
    const scoreNum = parseInt(score);
    
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
      setError('スコアは0〜100の数値で入力してください');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          score: scoreNum,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'スコアの保存に失敗しました');
      }

      // 成功したらモーダルを閉じる
      onSubmit && onSubmit(data);
      handleClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setUsername('');
    setScore('');
    setError('');
    setIsSubmitting(false);
    onClose();
  };

  const handleBack = () => {
    setStep(1);
    setScore('');
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {step === 1 ? (
          <form onSubmit={handleUsernameSubmit}>
            <h2 className={styles.title}>ユーザーネーム入力</h2>
            <p className={styles.description}>スコアを記録するためにユーザーネームを入力してください</p>
            
            <input
              type="text"
              className={styles.input}
              placeholder="ユーザーネーム"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={50}
              autoFocus
            />
            
            {error && <p className={styles.error}>{error}</p>}
            
            <div className={styles.buttonGroup}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={handleClose}
              >
                キャンセル
              </button>
              <button
                type="submit"
                className={styles.submitButton}
              >
                次へ
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleScoreSubmit}>
            <h2 className={styles.title}>スコア入力</h2>
            <p className={styles.description}>
              ユーザー: <strong>{username}</strong>
            </p>
            
            <input
              type="number"
              className={styles.input}
              placeholder="スコア (0〜100)"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              min="0"
              max="100"
              autoFocus
            />
            
            {error && <p className={styles.error}>{error}</p>}
            
            <div className={styles.buttonGroup}>
              <button
                type="button"
                className={styles.backButton}
                onClick={handleBack}
                disabled={isSubmitting}
              >
                戻る
              </button>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? '保存中...' : '保存'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
