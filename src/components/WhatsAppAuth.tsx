import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

interface WhatsAppAuthProps {
  status: 'loading' | 'ready' | 'disconnected';
  mode?: 'official' | 'simulation';
}

export const WhatsAppAuth: React.FC<WhatsAppAuthProps> = ({
  status,
  mode = 'simulation',
}) => {
  // If the server is offline/disconnected
  if (status === 'disconnected') {
    return (
      <div 
        className="glass-card" 
        style={{ 
          borderColor: 'var(--danger)', 
          background: 'var(--danger-bg)',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}
      >
        <div 
          style={{ 
            background: 'rgba(244, 63, 94, 0.2)', 
            color: 'var(--danger)', 
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
          <h4 className="text-sm font-semibold" style={{ color: 'var(--danger)' }}>WhatsApp Gateway Offline</h4>
          <p className="text-xs text-muted">Cannot connect to the local Express backend. Make sure the backend server is running (`npm run dev`).</p>
        </div>
      </div>
    );
  }

  // If the gateway is connected and active using official credentials
  if (mode === 'official') {
    return (
      <div 
        className="glass-card" 
        style={{ 
          borderColor: 'var(--success)', 
          background: 'rgba(16, 185, 129, 0.04)',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}
      >
        <div 
          style={{ 
            background: 'var(--success-bg)', 
            color: 'var(--success)', 
            width: '36px', 
            height: '36px', 
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <ShieldCheck size={18} />
        </div>
        <div>
          <h4 className="text-sm font-semibold" style={{ color: 'var(--success)' }}>WhatsApp Business Cloud Gateway Active</h4>
          <p className="text-xs text-muted">Photos and order details will be uploaded directly to Meta and sent to distributors via WhatsApp.</p>
        </div>
      </div>
    );
  }

  // Default: Simulation Mode (gateway is connected but no Meta keys configured)
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
          No Meta API credentials configured. Orders will be processed locally in the simulation portal. 
          To enable live delivery, set <code style={{ color: 'var(--text-primary)', background: 'rgba(0,0,0,0.3)', padding: '2px 4px', borderRadius: '3px' }}>WHATSAPP_ACCESS_TOKEN</code> and <code style={{ color: 'var(--text-primary)', background: 'rgba(0,0,0,0.3)', padding: '2px 4px', borderRadius: '3px' }}>WHATSAPP_PHONE_NUMBER_ID</code> on your backend server.
        </p>
      </div>
    </div>
  );
};
