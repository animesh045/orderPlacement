import React, { useState } from 'react';
import type { Order } from '../types';
import { CheckCircle2, XCircle, Trash2, RefreshCw, Eye } from 'lucide-react';

interface HistoryDashboardProps {
  orders: Order[];
  onToggleStatus: (orderId: string) => void;
  onDeleteOrder: (orderId: string) => void;
  onResendOrder: (order: Order) => void;
}

export const HistoryDashboard: React.FC<HistoryDashboardProps> = ({
  orders,
  onToggleStatus,
  onDeleteOrder,
  onResendOrder,
}) => {
  const [activePhotoModal, setActivePhotoModal] = useState<string | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="flex justify-between items-center">
        <h3 className="text-md font-semibold">Order History ({orders.length})</h3>
      </div>

      {orders.length === 0 ? (
        <div 
          className="glass-card text-center text-muted" 
          style={{ padding: '40px', background: 'rgba(255,255,255,0.02)' }}
        >
          No orders placed yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {orders.map((order) => (
            <div 
              key={order.id} 
              className="glass-card" 
              style={{ 
                padding: '16px',
                borderColor: order.status === 'delivered' ? 'var(--success)' : 'rgba(255,255,255,0.08)',
                background: order.status === 'delivered' ? 'rgba(16, 185, 129, 0.02)' : 'rgba(30, 41, 59, 0.4)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                animation: 'fadeIn 0.3s ease-out'
              }}
            >
              {/* Header: Date and Actions */}
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div>
                  <span className="text-xs text-muted" style={{ fontWeight: '500' }}>
                    {new Date(order.timestamp).toLocaleString('en-GB', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <div className="text-sm font-semibold mt-0.5">
                    To: {order.partyName ? (
                      <span>
                        <strong>{order.partyName}</strong>{' '}
                        <span className="text-xs text-muted font-normal">({order.phone.split(',').map(p => `+${p.trim()}`).join(', ')})</span>
                      </span>
                    ) : (
                      <span style={{ color: 'var(--primary)' }}>{order.phone.split(',').map(p => `+${p.trim()}`).join(', ')}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Status Toggle Button */}
                  <button 
                    onClick={() => onToggleStatus(order.id)}
                    className="flex items-center gap-1.5 text-xs font-semibold"
                    style={{
                      border: 'none',
                      background: 'none',
                      color: order.status === 'delivered' ? 'var(--success)' : 'var(--warning)',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: order.status === 'delivered' ? 'var(--success-bg)' : 'rgba(245, 158, 11, 0.1)'
                    }}
                  >
                    {order.status === 'delivered' ? (
                      <>
                        <CheckCircle2 size={14} />
                        Delivered
                      </>
                    ) : (
                      <>
                        <XCircle size={14} />
                        Pending
                      </>
                    )}
                  </button>

                  {/* Resend Action */}
                  <button 
                    onClick={() => onResendOrder(order)}
                    title="Resend to WhatsApp"
                    className="btn btn-secondary"
                    style={{ padding: '6px', minWidth: 'auto', borderRadius: '50%' }}
                  >
                    <RefreshCw size={12} />
                  </button>

                  {/* Delete Action */}
                  <button 
                    onClick={() => onDeleteOrder(order.id)}
                    title="Delete Record"
                    className="btn btn-secondary"
                    style={{ 
                      padding: '6px', 
                      minWidth: 'auto', 
                      borderRadius: '50%',
                      color: 'var(--danger)',
                      borderColor: 'rgba(239, 68, 68, 0.2)'
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              {/* Photo Thumbnails list */}
              <div 
                style={{ 
                  display: 'flex', 
                  gap: '8px', 
                  overflowX: 'auto', 
                  paddingBottom: '4px' 
                }}
              >
                {order.photos.map((photo, index) => (
                  <div 
                    key={index}
                    style={{ position: 'relative', flexShrink: 0, cursor: 'pointer' }}
                    onClick={() => setActivePhotoModal(photo)}
                  >
                    <img 
                      src={photo} 
                      alt={`Order Item ${index + 1}`} 
                      style={{ 
                        width: '60px', 
                        height: '60px', 
                        objectFit: 'cover', 
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}
                    />
                    <div 
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 'var(--radius-sm)',
                        opacity: 0,
                        transition: 'opacity 0.2s'
                      }}
                      className="hover-overlay"
                    >
                      <Eye size={12} color="#fff" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Photo lightbox modal */}
      {activePhotoModal && (
        <div 
          onClick={() => setActivePhotoModal(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.85)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <img 
            src={activePhotoModal} 
            alt="Large Order Sheet" 
            style={{ 
              maxWidth: '100%', 
              maxHeight: '85vh', 
              objectFit: 'contain',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.7)'
            }}
          />
        </div>
      )}
    </div>
  );
};
