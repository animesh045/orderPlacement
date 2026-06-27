import React, { useState } from 'react';
import type { Distributor, Order } from '../types';
import { Send, FileText, Star } from 'lucide-react';

interface OrderFormProps {
  distributors: Distributor[];
  selectedPhoto: string | null;
  onSubmit: (orderData: {
    distributorId: string;
    notes: string;
    priority: Order['priority'];
    phone: string;
  }) => void;
  isSubmitting: boolean;
}

export const OrderForm: React.FC<OrderFormProps> = ({
  distributors,
  selectedPhoto,
  onSubmit,
  isSubmitting,
}) => {
  const [selectedDistributorId, setSelectedDistributorId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [priority, setPriority] = useState<Order['priority']>('normal');
  const [phone, setPhone] = useState<string>('');

  const handleSelectDistributor = (id: string) => {
    setSelectedDistributorId(id);
    const dist = distributors.find(d => d.id === id);
    if (dist) {
      // Convert mock phone number format into clean number sequence for WhatsApp
      // e.g. "+1 (555) 012-6547" -> "15550126547"
      const cleanPhone = dist.phone.replace(/\D/g, '');
      setPhone(cleanPhone);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPhoto) {
      alert('Please upload or capture a photo of the order sheet first!');
      return;
    }
    if (!selectedDistributorId) {
      alert('Please select a distributor to send the order to!');
      return;
    }
    if (!phone.trim()) {
      alert('Please enter a WhatsApp phone number!');
      return;
    }

    onSubmit({
      distributorId: selectedDistributorId,
      notes,
      priority,
      phone: phone.trim(),
    });

    // Reset some states after submit
    setNotes('');
    setPriority('normal');
    setSelectedDistributorId('');
    setPhone('');
  };

  const selectedDistributor = distributors.find(d => d.id === selectedDistributorId);

  return (
    <form onSubmit={handleSubmit} className="glass-card flex flex-col gap-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted flex items-center gap-2 mb-2">
        <FileText size={16} className="text-primary" />
        Order Details
      </h3>

      {/* Distributor Selection */}
      <div className="form-group">
        <label className="form-label flex justify-between">
          <span>Select Recipient Distributor *</span>
          {selectedDistributor && (
            <span className="text-xs" style={{ color: 'var(--primary)' }}>
              Sends to: {selectedDistributor.email}
            </span>
          )}
        </label>
        
        <div className="distributor-grid">
          {distributors.map((distributor) => {
            const isSelected = selectedDistributorId === distributor.id;
            return (
              <div
                key={distributor.id}
                onClick={() => handleSelectDistributor(distributor.id)}
                className={`distributor-select-card ${isSelected ? 'selected' : ''}`}
              >
                <img
                  src={distributor.avatar}
                  alt={distributor.name}
                  className="dist-select-avatar"
                />
                <div className="dist-select-info">
                  <div className="dist-select-name">{distributor.name}</div>
                  <div className="dist-select-desc">{distributor.description}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="flex items-center text-xs" style={{ color: 'var(--warning)', gap: '2px' }}>
                      <Star size={10} fill="currentColor" />
                      {distributor.rating}
                    </span>
                    {distributor.tags.slice(0, 1).map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs text-muted"
                        style={{
                          background: 'rgba(255, 255, 255, 0.04)',
                          padding: '1px 4px',
                          borderRadius: '2px',
                          fontSize: '9px'
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recipient WhatsApp Phone Number */}
      {selectedDistributorId && (
        <div className="form-group">
          <label className="form-label" htmlFor="whatsapp-phone">
            Recipient WhatsApp Phone Number
          </label>
          <input
            type="text"
            id="whatsapp-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. 919876543210 (Country code + number, no + sign or spaces)"
            className="form-input"
            required
          />
          <p className="text-xs text-muted" style={{ fontStyle: 'italic', marginTop: '2px' }}>
            * Format: [Country Code][Phone Number] without symbols. Example: India is 91XXXXXXXXXX, USA is 1XXXXXXXXXX. Use your own number to test!
          </p>
        </div>
      )}

      {/* Priority Selector */}
      <div className="form-group">
        <label className="form-label">Order Priority</label>
        <div className="priority-toggle">
          {(['normal', 'high', 'urgent'] as Order['priority'][]).map((p) => {
            const isActive = priority === p;
            return (
              <div
                key={p}
                onClick={() => setPriority(p)}
                className={`priority-option ${p} ${isActive ? 'active' : ''}`}
              >
                {p.toUpperCase()}
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Notes */}
      <div className="form-group">
        <label className="form-label" htmlFor="order-notes">
          Extra Message / Order Notes (Optional)
        </label>
        <textarea
          id="order-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any extra message, delivery instructions, brand preferences, or requests here..."
          className="form-input"
        />
      </div>

      {/* Submit Action */}
      <button
        type="submit"
        disabled={isSubmitting || !selectedPhoto || !selectedDistributorId}
        className="btn w-full mt-2"
        style={(!selectedPhoto || !selectedDistributorId) ? {} : { boxShadow: 'var(--shadow-glow)' }}
      >
        {isSubmitting ? (
          <>
            <span className="status-dot" style={{ animation: 'pulse-border 1s infinite' }}></span>
            Sending Order...
          </>
        ) : (
          <>
            <Send size={16} />
            Send Photo Order
          </>
        )}
      </button>
      
      {!selectedPhoto && (
        <p className="text-xs text-muted text-center" style={{ fontStyle: 'italic' }}>
          * Take or upload a photo first to enable sending.
        </p>
      )}
    </form>
  );
};
