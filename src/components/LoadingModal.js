import React from 'react';
import styles from './LoadingModal.module.css';

/**
 * LoadingModal - A modal overlay with a spinner for showing loading state
 * @param {boolean} isLoading - Controls whether the modal is visible
 * @param {string} message - Optional message to display (default: "かきこみちゅう...")
 */
const LoadingModal = ({ isLoading, message = 'かきこみちゅう...' }) => {
  if (!isLoading) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Spinner */}
        <div className={styles.spinner} />

        {/* Message */}
        <p className={styles.message}>{message}</p>
      </div>
    </div>
  );
};

export default LoadingModal;
