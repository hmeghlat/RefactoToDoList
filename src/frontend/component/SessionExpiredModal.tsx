import React from 'react';

interface Props {
    onReconnect: () => void;
}

const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(15, 15, 40, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    padding: '24px',
};

const modalStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 20px 60px rgba(25, 25, 112, 0.2)',
    padding: '40px 36px',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
    fontFamily: "'Inter', sans-serif",
};

const iconStyle: React.CSSProperties = {
    fontSize: '2.5rem',
    marginBottom: '16px',
};

const titleStyle: React.CSSProperties = {
    fontFamily: "'Bricolage Grotesque', sans-serif",
    fontSize: '1.3rem',
    fontWeight: 600,
    color: '#191970',
    margin: '0 0 10px 0',
};

const textStyle: React.CSSProperties = {
    fontSize: '0.9rem',
    color: '#6b7280',
    margin: '0 0 28px 0',
    lineHeight: 1.6,
};

const btnStyle: React.CSSProperties = {
    padding: '12px 28px',
    backgroundColor: '#191970',
    color: '#ECEFF1',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: 600,
    fontFamily: "'Inter', sans-serif",
    cursor: 'pointer',
};

export default function SessionExpiredModal({ onReconnect }: Props) {
    return (
        <div style={overlayStyle}>
            <div style={modalStyle}>
                <div style={iconStyle}>🔒</div>
                <h2 style={titleStyle}>Session expirée</h2>
                <p style={textStyle}>
                    Votre session a expiré.<br />Merci de vous reconnecter pour continuer.
                </p>
                <button style={btnStyle} onClick={onReconnect}>
                    Se reconnecter
                </button>
            </div>
        </div>
    );
}
