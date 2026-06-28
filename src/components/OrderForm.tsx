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

  // Auto-select first party on load, or reset if selected party is deleted/invalid
  useEffect(() => {
    if (parties.length > 0) {
      if (selectedPartyId === '') {
        setSelectedPartyId(parties[0].id);
      } else if (selectedPartyId !== 'custom' && !parties.some(p => p.id === selectedPartyId)) {
        setSelectedPartyId(parties[0].id);
      }
    } else {
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
        padding: '20px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '16px',
        background: 'rgba(15, 23, 42, 0.45)',
        border: '1.5px solid rgba(255, 255, 255, 0.08)'
      }}
    >
      {/* Parties Selection Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-2">
          <Users size={14} color="var(--primary)" />
          Select Recipient Party
        </span>
        <button
          type="button"
          onClick={onManagePartiesClick}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--primary)',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            transition: 'var(--transition-fast)'
          }}
          onMouseOver={(e) => e.currentTarget.style.color = 'var(--primary-hover)'}
          onMouseOut={(e) => e.currentTarget.style.color = 'var(--primary)'}
        >
          <Settings size={13} />
          Configure Parties
        </button>
      </div>

      {/* Quick Select Party Grid */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', 
          gap: '8px'
        }}
      >
        {parties.map((party) => {
          const isSelected = selectedPartyId === party.id;
          return (
            <button
              key={party.id}
              type="button"
              onClick={() => setSelectedPartyId(party.id)}
              style={{
                border: isSelected ? '1.5px solid var(--primary)' : '1px solid rgba(255,255,255,0.08)',
                background: isSelected 
                  ? 'rgba(59, 130, 246, 0.12)' 
                  : 'rgba(15, 23, 42, 0.45)',
                color: isSelected ? '#fff' : 'var(--text-secondary)',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                boxShadow: isSelected ? 'var(--shadow-glow), inset 0 0 10px rgba(59, 130, 246, 0.1)' : 'none',
                transition: 'all 0.2s ease-in-out',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseOver={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                }
              }}
              onMouseOut={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.background = 'rgba(15, 23, 42, 0.45)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                }
              }}
            >
              <span className="text-xs font-semibold" style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', width: '100%' }}>
                {party.name}
              </span>
              <span 
                style={{ 
                  fontSize: '9px', 
                  color: isSelected ? 'var(--primary)' : 'var(--text-muted)',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                {party.phone2 ? '👥 2 numbers' : '👤 1 number'}
              </span>
            </button>
          );
        })}

        {/* Custom Number Option */}
        {(() => {
          const isSelected = selectedPartyId === 'custom';
          return (
            <button
              type="button"
              onClick={() => setSelectedPartyId('custom')}
              style={{
                border: isSelected ? '1.5px solid var(--accent-purple)' : '1px solid rgba(255,255,255,0.08)',
                background: isSelected 
                  ? 'rgba(168, 85, 247, 0.12)' 
                  : 'rgba(15, 23, 42, 0.45)',
                color: isSelected ? '#fff' : 'var(--text-secondary)',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: '4px',
                boxShadow: isSelected ? '0 0 20px rgba(168, 85, 247, 0.25), inset 0 0 10px rgba(168, 85, 247, 0.1)' : 'none',
                transition: 'all 0.2s ease-in-out',
                height: '100%'
              }}
              onMouseOver={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                }
              }}
              onMouseOut={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.background = 'rgba(15, 23, 42, 0.45)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                }
              }}
            >
              <span className="text-xs font-semibold">Custom Number</span>
              <span 
                style={{ 
                  fontSize: '9px', 
                  color: isSelected ? 'var(--accent-purple)' : 'var(--text-muted)',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                ✏️ enter number
              </span>
            </button>
          );
        })()}
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
            padding: '12px 14px', 
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-secondary)',
            borderLeft: '3px solid var(--primary)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}
        >
          {(() => {
            const p = parties.find(x => x.id === selectedPartyId);
            if (!p) return null;
            return (
              <>
                <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                  Recipient Party: {p.name.trim()}
                </div>
                <div className="font-mono text-xs text-muted" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span>🟢 Primary WhatsApp: +{p.phone}</span>
                  {p.phone2 && <span>🟢 Secondary WhatsApp: +{p.phone2}</span>}
                </div>
              </>
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


