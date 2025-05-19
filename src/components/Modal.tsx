import React, { useEffect } from 'react';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ title, onClose, children }) => {
  // Close modal when Escape key is pressed
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);

    // Prevent body scrolling when modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);

  // Close modal when clicking outside
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="delivery-preferences-modal"
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        animation: 'fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'white',
          padding: '0',
          borderRadius: '20px',
          maxWidth: '480px',
          width: '90%',
          position: 'relative',
          boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2)',
          animation: 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          overflow: 'hidden',
        }}
      >
        {/* Green accent bar at the top */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: 'linear-gradient(90deg, #1a712e, #2a9d4a)',
            borderRadius: '20px 20px 0 0',
          }}
        />

        {/* Modal header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 24px',
            borderBottom: '1px solid rgba(26, 113, 46, 0.1)',
            position: 'relative',
          }}
        >
          <h3
            style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#1a712e',
              margin: 0,
              position: 'relative',
            }}
          >
            {title}
            <span
              style={{
                position: 'absolute',
                bottom: '-8px',
                left: 0,
                width: '40px',
                height: '3px',
                backgroundColor: '#1a712e',
                borderRadius: '3px',
              }}
            />
          </h3>
          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: 'rgba(26, 113, 46, 0.1)',
              border: 'none',
              cursor: 'pointer',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              transition: 'all 0.3s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(26, 113, 46, 0.2)';
              e.currentTarget.style.transform = 'rotate(90deg)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(26, 113, 46, 0.1)';
              e.currentTarget.style.transform = 'rotate(0deg)';
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#1a712e"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal content */}
        <div
          style={{
            padding: '24px',
            position: 'relative',
          }}
        >
          {/* Background decoration */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: '150px',
              height: '150px',
              background: 'radial-gradient(circle, rgba(26, 113, 46, 0.05) 0%, transparent 70%)',
              borderRadius: '50%',
              zIndex: 0,
              pointerEvents: 'none',
            }}
          />

          {/* Actual content */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
