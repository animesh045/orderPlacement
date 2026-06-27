import React from 'react';
import { QrCode, CheckCircle, Smartphone, WifiOff, AlertTriangle } from 'lucide-react';

interface WhatsAppAuthProps {
  status: 'loading' | 'authorized' | 'notAuthorized' | 'sleepMode' | 'starting' | 'blocked' | 'disconnected';
  qrCode: string | null;
  mode: 'official' | 'simulation';
}

export const WhatsAppAuth: React.FC<WhatsAppAuthProps> = ({
  status,
  qrCode,
  mode,
}) => {
  // 1. Simulation Mode (no env variables configured)
  if (mode === 'simulation') {
    return (
      <div 
        className="glass-card" 
        style={{ 
          borderColor: 'var(--warning)', 
          background: 'var(--warning-bg)',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}
      >
        <div 
          style={{ 
            background: 'rgba(245, 158, 11, 0.15)', 
            color: 'var(--warning)', 
            width: '36px', 
            height: '36px', 
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <AlertTriangle size={18} />
        </div>
        <div>
          <h4 className="text-sm font-semibold" style={{ color: 'var(--warning)' }}>WhatsApp Gateway Simulation Mode</h4>
          <p className="text-xs text-muted">
            No Green API credentials configured. Orders will be saved locally. To link your real WhatsApp, 
            add <code style={{ color: 'var(--text-primary)', background: 'rgba(0,0,0,0.3)', padding: '2px 4px', borderRadius: '3px' }}>VITE_GREEN_API_ID_INSTANCE</code> and <code style={{ color: 'var(--text-primary)', background: 'rgba(0,0,0,0.3)', padding: '2px 4px', borderRadius: '3px' }}>VITE_GREEN_API_TOKEN_INSTANCE</code> in your Vercel/environment settings.
          </p>
        </div>
      </div>
    );
  }

  // 2. Active Mode (Linked successfully)
  if (status === 'authorized') {
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
            <h4 className="text-sm font-semibold" style={{ color: 'var(--success)' }}>WhatsApp Gateway Connected (Green API Cloud)</h4>
            <p className="text-xs text-muted">All photo orders will automatically route to WhatsApp instantly from the cloud.</p>
          </div>
        </div>
      </div>
    );
  }

  // 3. Other statuses (Connecting, Blocked, Sleep, or QR)
  return (
    <div 
      className="glass-card" 
      style={{ 
        borderColor: status === 'disconnected' || status === 'blocked' ? 'var(--danger)' : 'var(--primary)',
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
              background: status === 'disconnected' || status === 'blocked' ? 'var(--danger-bg)' : 'var(--primary-glow)',
              color: status === 'disconnected' || status === 'blocked' ? 'var(--danger)' : 'var(--primary)',
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
              {(status === 'loading' || status === 'starting') && 'Starting Green API Gateway...'}
              {status === 'notAuthorized' && 'Link WhatsApp Account'}
              {status === 'sleepMode' && 'WhatsApp Sleep Mode (Phone Offline)'}
              {status === 'blocked' && 'WhatsApp Account Blocked'}
              {status === 'disconnected' && 'Green API Server Unreachable'}
            </h3>
            <p className="text-xs text-muted mt-1">
              {(status === 'loading' || status === 'starting') && 'Connecting to Green API instance. Please wait...'}
              {status === 'notAuthorized' && 'Scan this QR code using your WhatsApp app to link this device.'}
              {status === 'sleepMode' && 'The linked phone is offline or has no internet connection.'}
              {status === 'blocked' && 'This instance was blocked. Check your Green API account dashboard.'}
              {status === 'disconnected' && 'Failed to make API requests. Verify your internet connection or keys.'}
            </p>
          </div>
        </div>
      </div>

      {(status === 'loading' || status === 'starting') && (
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

      {status === 'notAuthorized' && (
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
              <li>Tap <strong>Linked Devices</strong> under Settings/Menu.</li>
              <li>Tap <strong>Link a Device</strong> and point your camera at the QR code.</li>
            </ol>
            <p className="text-xs text-muted" style={{ fontStyle: 'italic', marginTop: '4px' }}>
              * Linked securely in the cloud. You only need to link once.
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
              <p className="text-xs text-muted animate-pulse">Requesting QR Code...</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
