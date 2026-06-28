import React, { useState, useEffect } from 'react';
import { Send, Phone, Settings, Users } from 'lucide-react';
import type { Party } from '../types';

interface OrderFormProps {
  photosCount: number;
  parties: Party[];
  onSubmit: (formData: { phone: string; partyName?: string }) => void;
  isSubmitting: boolean;
  onManagePartiesClick: () => void;
}

export const OrderForm: React.FC<OrderFormProps> = ({
  photosCount,
  parties,
  onSubmit,
  isSubmitting,
  onManagePartiesClick
}) => {
  const [selectedPartyId, setSelectedPartyId] = useState<string | 'custom'>('');
  const [customPhone, setCustomPhone] = useState('');

  // Auto-select first party on load if available
  useEffect(() => {
    if (parties.length > 0 && selectedPartyId === '') {
      setSelectedPartyId(parties[0].id);
    } else if (parties.length === 0) {
      setSelectedPartyId('custom');
    }
  }, [parties, selectedPartyId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (photosCount === 0) return;

    if (selectedPartyId === 'custom') {
      if (!customPhone) return;
      const cleanPhone = customPhone.replace(/\D/g, '');
      onSubmit({ phone: cleanPhone });
    } else {
      const party = parties.find(p => p.id === selectedPartyId);
      if (!party) return;

      const phones = [party.phone];
      if (party.phone2) {
        phones.push(party.phone2);
      }
      
      onSubmit({
        phone: phones.join(','),
        partyName: party.name
      });
    }
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
      {/* Parties Selection Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="text-xs text-muted font-semibold flex items-center gap-1.5">
          <Users size={13} />
          Select Recipient Party:
        </span>
        <button
          type="button"
          onClick={onManagePartiesClick}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--primary)',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            transition: 'var(--transition-fast)'
          }}
          onMouseOver={(e) => e.currentTarget.style.color = 'var(--primary-hover)'}
          onMouseOut={(e) => e.currentTarget.style.color = 'var(--primary)'}
        >
          <Settings size={12} />
          Configure Parties
        </button>
      </div>

      {/* Quick Select Party Grid */}
      <div className="flex flex-wrap gap-2">
        {parties.map((party) => (
          <button
            key={party.id}
            type="button"
            onClick={() => setSelectedPartyId(party.id)}
            className="text-xs"
            style={{
              border: '1px solid rgba(255,255,255,0.08)',
              background: selectedPartyId === party.id ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
              color: selectedPartyId === party.id ? '#fff' : 'var(--text-secondary)',
              padding: '6px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '2px'
            }}
          >
            <span>{party.name}</span>
            <span style={{ fontSize: '9px', opacity: 0.7 }}>
              {party.phone2 ? '2 numbers' : '1 number'}
            </span>
          </button>
        ))}

        <button
          type="button"
          onClick={() => setSelectedPartyId('custom')}
          className="text-xs"
          style={{
            border: '1px solid rgba(255,255,255,0.08)',
            background: selectedPartyId === 'custom' ? 'var(--accent-purple)' : 'rgba(255,255,255,0.03)',
            color: selectedPartyId === 'custom' ? '#fff' : 'var(--text-secondary)',
            padding: '6px 12px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500',
            transition: 'all 0.2s',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center'
          }}
        >
          Custom Number
        </button>
      </div>

      {/* Recipient Phone input (only if custom is selected) */}
      {selectedPartyId === 'custom' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }} className="animate-fadeIn">
          <label className="text-xs font-semibold text-muted flex items-center gap-1.5">
            <Phone size={12} />
            Recipient Phone Number
          </label>
          <input 
            type="text" 
            value={customPhone} 
            onChange={(e) => setCustomPhone(e.target.value)}
            placeholder="e.g. 919876543210 (with country code)"
            required
            style={{ 
              width: '100%', 
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1.5px solid rgba(255,255,255,0.08)',
              background: 'rgba(0,0,0,0.2)',
              color: '#fff',
              fontSize: '14px'
            }}
          />
        </div>
      )}

      {/* Selected Party Summary */}
      {selectedPartyId !== 'custom' && selectedPartyId !== '' && (
        <div 
          style={{ 
            fontSize: '12px', 
            background: 'rgba(0,0,0,0.15)', 
            padding: '8px 12px', 
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-secondary)'
          }}
        >
          {(() => {
            const p = parties.find(x => x.id === selectedPartyId);
            if (!p) return null;
            return (
              <p>
                Sending to: <strong>{p.name}</strong> 
                <span className="font-mono text-xs block mt-1">
                  📞 {p.phone} {p.phone2 ? ` &  📞 ${p.phone2}` : ''}
                </span>
              </p>
            );
          })()}
        </div>
      )}

      {/* Dispatch Button */}
      <button 
        type="submit" 
        className="btn btn-primary flex items-center justify-center gap-2"
        disabled={isSubmitting || photosCount === 0 || (selectedPartyId === 'custom' && !customPhone)}
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

