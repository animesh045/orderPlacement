import React, { useState } from 'react';
import { X, Plus, Trash2, Edit2, Check, UserPlus } from 'lucide-react';
import type { Party } from '../types';

interface ManagePartiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  parties: Party[];
  onAddParty: (party: Omit<Party, 'id'>) => void;
  onUpdateParty: (party: Party) => void;
  onDeleteParty: (id: string) => void;
}

export const ManagePartiesModal: React.FC<ManagePartiesModalProps> = ({
  isOpen,
  onClose,
  parties,
  onAddParty,
  onUpdateParty,
  onDeleteParty
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [phone2, setPhone2] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    // Clean phone numbers to digits only
    const cleanPhone = phone.replace(/\D/g, '');
    const cleanPhone2 = phone2.replace(/\D/g, '');

    if (editingId) {
      onUpdateParty({
        id: editingId,
        name,
        phone: cleanPhone,
        phone2: cleanPhone2 || undefined
      });
      setEditingId(null);
    } else {
      onAddParty({
        name,
        phone: cleanPhone,
        phone2: cleanPhone2 || undefined
      });
    }

    // Reset form
    setName('');
    setPhone('');
    setPhone2('');
  };

  const handleEdit = (party: Party) => {
    setEditingId(party.id);
    setName(party.name);
    setPhone(party.phone);
    setPhone2(party.phone2 || '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setPhone('');
    setPhone2('');
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(2, 6, 23, 0.85)',
        backdropFilter: 'blur(12px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div 
        className="glass-card animate-scaleUp"
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px',
          gap: '20px',
          background: 'rgba(15, 23, 42, 0.8)',
          border: '1.5px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), var(--shadow-glow)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <UserPlus size={20} color="var(--primary)" />
            Configure Parties
          </h2>
          <button 
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'var(--transition-fast)'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
            {/* Party Name */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label className="text-xs font-semibold text-muted">Party / Customer Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Apex Logistics"
                required
                style={{ 
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(0,0,0,0.3)',
                  color: '#fff',
                  fontSize: '13px'
                }}
              />
            </div>

            {/* Numbers Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label className="text-xs font-semibold text-muted">WhatsApp Number 1</label>
                <input 
                  type="text" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 919876543210"
                  required
                  style={{ 
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: 'rgba(0,0,0,0.3)',
                    color: '#fff',
                    fontSize: '13px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label className="text-xs font-semibold text-muted">WhatsApp Number 2 (Optional)</label>
                <input 
                  type="text" 
                  value={phone2} 
                  onChange={(e) => setPhone2(e.target.value)}
                  placeholder="e.g. 918888888888"
                  style={{ 
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: 'rgba(0,0,0,0.3)',
                    color: '#fff',
                    fontSize: '13px'
                  }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
            {editingId && (
              <button 
                type="button" 
                onClick={handleCancelEdit}
                className="btn btn-secondary text-xs"
                style={{ padding: '8px 16px' }}
              >
                Cancel Edit
              </button>
            )}
            <button 
              type="submit" 
              className="btn btn-primary text-xs flex items-center gap-1.5"
              style={{ padding: '8px 16px', background: editingId ? 'var(--success)' : 'var(--primary)' }}
            >
              {editingId ? <Check size={14} /> : <Plus size={14} />}
              {editingId ? 'Save Changes' : 'Add Party'}
            </button>
          </div>
        </form>

        <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.08)' }} />

        {/* Parties List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted">Current Parties ({parties.length})</h3>
          <div 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '8px', 
              maxHeight: '260px', 
              overflowY: 'auto',
              paddingRight: '4px'
            }}
          >
            {parties.length === 0 ? (
              <p className="text-xs text-muted text-center py-6">No parties configured. Add one above.</p>
            ) : (
              parties.map((party) => (
                <div 
                  key={party.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(0,0,0,0.2)',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid rgba(255,255,255,0.04)'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span className="text-sm font-semibold">{party.name}</span>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <span className="text-xs text-muted font-mono flex items-center gap-1">
                        Num1: {party.phone}
                      </span>
                      {party.phone2 && (
                        <span className="text-xs text-muted font-mono flex items-center gap-1">
                          Num2: {party.phone2}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={() => handleEdit(party)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        padding: '6px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'var(--transition-fast)'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                        e.currentTarget.style.color = '#fff';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'none';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                      }}
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => onDeleteParty(party.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--danger)',
                        cursor: 'pointer',
                        padding: '6px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'var(--transition-fast)'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'var(--danger-bg)'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
