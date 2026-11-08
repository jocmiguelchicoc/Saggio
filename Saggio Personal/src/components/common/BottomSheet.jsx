import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export function BottomSheet({ isOpen, onClose, title, children }) {
  const [viewportHeight, setViewportHeight] = useState(null);
  const [viewportOffsetTop, setViewportOffsetTop] = useState(0);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    // Bloquear scroll de fondo mientras el sheet esté abierto
    document.body.style.overflow = 'hidden';

    // Manejar el viewport cuando el teclado virtual de Android/iOS se abre
    const updateViewport = () => {
      if (typeof window !== 'undefined' && window.visualViewport) {
        setViewportHeight(window.visualViewport.height);
        setViewportOffsetTop(window.visualViewport.offsetTop);
      }
    };

    if (typeof window !== 'undefined' && window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateViewport);
      window.visualViewport.addEventListener('scroll', updateViewport);
      updateViewport();
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
      if (typeof window !== 'undefined' && window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateViewport);
        window.visualViewport.removeEventListener('scroll', updateViewport);
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: viewportOffsetTop,
        left: 0,
        right: 0,
        bottom: 0,
        height: viewportHeight ? `${viewportHeight}px` : '100dvh',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}
    >
      {/* Fondo oscuro traslúcido */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.2s ease-out',
        }}
      />

      {/* Hoja deslizable */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 480,
          margin: '0 auto',
          backgroundColor: 'var(--bg-card)',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          border: '1px solid var(--border-subtle)',
          borderBottom: 'none',
          boxShadow: '0 -10px 30px rgba(0, 0, 0, 0.35)',
          maxHeight: viewportHeight ? `${Math.min(viewportHeight - 12, 680)}px` : '90dvh',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          paddingBottom: 'env(safe-area-inset-bottom, 12px)',
        }}
      >
        {/* Barra superior de arrastre */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 8, paddingBottom: 4 }}>
          <div
            style={{
              width: 36,
              height: 4,
              borderRadius: 9999,
              backgroundColor: 'var(--bg-subtle)',
            }}
          />
        </div>

        {/* Cabecera del BottomSheet */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 18px 10px 18px',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <h3 style={{ fontSize: '1.08rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 12,
              cursor: 'pointer',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div
          style={{
            padding: '16px 18px',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            flex: 1,
            maxHeight: '100%',
          }}
        >
          {children}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

