import React, { useState } from 'react';
import { Send, Phone } from 'lucide-react';

interface OrderFormProps {
  photosCount: number;
  onSubmit: (formData: { phone: string }) => void;
  isSubmitting: boolean;
}

// Quick Saved Contacts to make typing numbers optional
const QUICK_CONTACTS = [
  { name: 'Apex Logistics', phone: '919876543210' },
  { name: 'SwiftCare Pharma', phone: '918888888888' },
  { name: 'Metro Foods', phone: '917777777777' }
];

export const OrderForm: React.FC<OrderFormProps> = ({
  photosCount,
  onSubmit,
  isSubmitting,
}) => {
  const [phone, setPhone] = useState('919876543210');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || photosCount === 0) return;
    
    // Ensure only digits are passed
    const cleanPhone = phone.replace(/\D/g, '');
    onSubmit({ phone: cleanPhone });
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="glass-card animate-slideUp"
      style={{ 
        padding: '16px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '12px',
        background: 'rgba(30, 41, 59, 0.5)'
      }}
    >
      {/* Recipient Phone input */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label className="text-xs font-semibold text-muted flex items-center gap-1.5">
          <Phone size={12} />
          Recipient Phone Number
        </label>
        <div style={{ position: 'relative' }}>
          <input 
            type="text" 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. 919876543210 (with country code)"
            required
            style={{ 
              width: '100%', 
              padding: '10px 12px',
              paddingLeft: '14px',
              borderRadius: 'var(--radius-sm)',
              border: '1.5px solid rgba(255,255,255,0.08)',
              background: 'rgba(0,0,0,0.2)',
              color: '#fff',
              fontSize: '14px'
            }}
          />
        </div>
      </div>

      {/* Quick contacts chips */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <span className="text-xs text-muted" style={{ fontWeight: '500' }}>Quick Select Contact:</span>
        <div className="flex flex-wrap gap-2">
          {QUICK_CONTACTS.map((contact) => (
            <button
              key={contact.phone}
              type="button"
              onClick={() => setPhone(contact.phone)}
              className="text-xs"
              style={{
                border: '1px solid rgba(255,255,255,0.08)',
                background: phone.replace(/\D/g, '') === contact.phone ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
                color: phone.replace(/\D/g, '') === contact.phone ? '#fff' : 'var(--text-secondary)',
                padding: '4px 10px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
            >
              {contact.name}
            </button>
          ))}
        </div>
      </div>

      {/* Dispatch Button */}
      <button 
        type="submit" 
        className="btn btn-primary flex items-center justify-center gap-2"
        disabled={isSubmitting || photosCount === 0 || !phone}
        style={{ 
          marginTop: '6px', 
          width: '100%',
          padding: '12px',
          fontWeight: '700',
          fontSize: '14px'
        }}
      >
        <Send size={15} />
        {isSubmitting 
          ? 'Sending Order via WhatsApp...' 
          : `Send Order (${photosCount} Photo${photosCount !== 1 ? 's' : ''})`
        }
      </button>

      {photosCount === 0 && (
        <span className="text-center text-xs text-muted" style={{ color: 'var(--danger)', opacity: 0.8 }}>
          * Add at least 1 photo of the order sheets to send.
        </span>
      )}
    </form>
  );
};
