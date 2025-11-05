import React from 'react';

/**
 * LoadingModal - A modal overlay with a spinner for showing loading state
 * @param {boolean} isLoading - Controls whether the modal is visible
 * @param {string} message - Optional message to display (default: "かきこみちゅう...")
 */
const LoadingModal = ({ isLoading, message = 'かきこみちゅう...' }) => {
  if (!isLoading) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px 40px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
      }}>
        {/* Spinner */}
        <div style={{
          width: '60px',
          height: '60px',
          border: '6px solid #f3f3f3',
          borderTop: '6px solid #4CAF50',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        
        {/* Message */}
        <p style={{
          margin: 0,
          fontSize: '1.2em',
          fontWeight: 'bold',
          color: '#333',
        }}>
          {message}
        </p>

        {/* CSS animation for spinner */}
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default LoadingModal;
