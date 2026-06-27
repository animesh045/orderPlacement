import React from 'react';
import { QrCode, CheckCircle, RefreshCw, Smartphone, WifiOff } from 'lucide-react';

interface WhatsAppAuthProps {
  status: 'loading' | 'qr' | 'ready' | 'disconnected';
  qrCode: string | null;
  onRefresh: () => void;
}

export const WhatsAppAuth: React.FC<WhatsAppAuthProps> = ({
  status,
  qrCode,
  onRefresh,
}) => {
  if (status === 'ready') {
    return (
      <div 
        className="glass-card" 
        style={{ 
          borderColor: 'var(--success)', 
          background: 'rgba(16, 185, 129, 0.04)',
          padding: '12px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div className="flex items-center gap-3">
          <div 
            style={{ 
              background: 'var(--success-bg)', 
              color: 'var(--success)', 
              width: '32px', 
              height: '32px', 
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <CheckCircle size={18} />
          </div>
          <div>
            <h4 className="text-sm font-semibold" style={{ color: 'var(--success)' }}>WhatsApp Gateway Active</h4>
            <p className="text-xs text-muted">Orders will be automatically routed to distributors' WhatsApp accounts.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="glass-card" 
      style={{ 
        borderColor: status === 'disconnected' ? 'var(--danger)' : 'var(--primary)',
        background: 'rgba(15, 23, 42, 0.6)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        padding: '24px'
      }}
    >
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div className="flex items-start gap-3">
          <div 
            className="brand-icon" 
            style={{ 
              background: status === 'disconnected' ? 'var(--danger-bg)' : 'var(--primary-glow)',
              color: status === 'disconnected' ? 'var(--danger)' : 'var(--primary)',
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {status === 'disconnected' ? <WifiOff size={22} /> : <QrCode size={22} />}
          </div>
          <div>
            <h3 className="text-md font-semibold">
              {status === 'loading' && 'Starting WhatsApp Gateway...'}
              {status === 'qr' && 'Link WhatsApp Account'}
              {status === 'disconnected' && 'WhatsApp Disconnected'}
            </h3>
            <p className="text-xs text-muted mt-1">
              {status === 'loading' && 'Spawning local browser instance. Please wait a moment...'}
              {status === 'qr' && 'Scan the QR code to automate direct message ordering.'}
              {status === 'disconnected' && 'Gateway failed to authenticate or was logged out.'}
            </p>
          </div>
        </div>

        {status === 'disconnected' && (
          <button 
            onClick={onRefresh}
            className="btn btn-secondary text-xs flex items-center gap-1"
            style={{ padding: '6px 12px' }}
          >
            <RefreshCw size={14} />
            Retry Connection
          </button>
        )}
      </div>

      {status === 'loading' && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}>
          <div 
            style={{
              width: '40px',
              height: '40px',
              border: '3px solid rgba(255,255,255,0.05)',
              borderTopColor: 'var(--primary)',
              borderRadius: '50%',
              animation: 'scan 1s linear infinite'
            }}
          ></div>
        </div>
      )}

      {status === 'qr' && (
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: '1.2fr 0.8fr', 
            gap: '24px', 
            alignItems: 'center',
            background: 'rgba(0,0,0,0.2)',
            padding: '20px',
            borderRadius: 'var(--radius-md)'
          }}
        >
          {/* Instructions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-2">
              <Smartphone size={14} /> Link Instructions
            </h4>
            <ol style={{ paddingLeft: '16px', fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>Open <strong>WhatsApp</strong> on your phone.</li>
              <li>Tap <strong>Menu</strong> (Android three dots) or <strong>Settings</strong> (iOS cog).</li>
              <li>Select <strong>Linked Devices</strong>.</li>
              <li>Tap <strong>Link a Device</strong> and point your phone camera at the QR code.</li>
            </ol>
            <p className="text-xs text-muted" style={{ fontStyle: 'italic', marginTop: '4px' }}>
              * Sessions will be saved locally. You only need to link once.
            </p>
          </div>

          {/* QR Image View */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {qrCode ? (
              <div 
                style={{ 
                  background: '#fff', 
                  padding: '12px', 
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: 'var(--shadow-glow)',
                  animation: 'pulse-border 2s infinite',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <img 
                  src={qrCode} 
                  alt="WhatsApp Linking QR Code" 
                  style={{ width: '150px', height: '150px', objectFit: 'contain' }}
                />
              </div>
            ) : (
              <p className="text-xs text-muted animate-pulse">Generating QR Code...</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
