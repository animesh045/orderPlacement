import React, { useState } from 'react';
import type { Order, Distributor } from '../types';
import { CheckCircle, Truck, Package, XCircle, Star, MessageCircle, Send, X } from 'lucide-react';

interface DistributorPortalProps {
  orders: Order[];
  distributors: Distributor[];
  onUpdateStatus: (
    orderId: string,
    status: Order['status'],
    commentText?: string,
    authorRole?: 'retailer' | 'distributor',
    authorName?: string
  ) => void;
  onAddComment: (orderId: string, author: 'retailer' | 'distributor', name: string, message: string) => void;
}

export const DistributorPortal: React.FC<DistributorPortalProps> = ({
  orders,
  distributors,
  onUpdateStatus,
  onAddComment,
}) => {
  const [activeDistributorId, setActiveDistributorId] = useState<string>(distributors[0]?.id || '');
  const [openChatOrderId, setOpenChatOrderId] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState<string>('');
  const [zoomPhotoUrl, setZoomPhotoUrl] = useState<string | null>(null);

  const activeDistributor = distributors.find((d) => d.id === activeDistributorId);

  // Filter orders addressed to the active distributor
  const distributorOrders = orders.filter((order) => order.distributorId === activeDistributorId);

  const QUICK_MESSAGES_DISTRIBUTOR = [
    "We have received your order.",
    "Items are being packed.",
    "Order has been shipped and is on the way.",
    "Delivery successfully completed. Thank you!"
  ];

  const renderStepper = (status: Order['status']) => {
    if (status === 'cancelled') {
      return (
        <div 
          style={{ 
            color: 'var(--danger)', 
            background: 'var(--danger-bg)', 
            padding: '4px 10px', 
            borderRadius: 'var(--radius-sm)', 
            border: '1px solid rgba(244, 63, 94, 0.15)',
            fontSize: '11px',
            fontWeight: '600',
            textAlign: 'center',
            margin: '8px 0'
          }}
        >
          🚫 Order Cancelled
        </div>
      );
    }

    const isAccepted = status !== 'pending';
    const isShipped = status === 'shipped' || status === 'delivered';
    const isDelivered = status === 'delivered';

    return (
      <div className="status-stepper" style={{ maxWidth: '280px' }}>
        <div className="stepper-step active">
          <div className="stepper-dot"></div>
          <span className="stepper-label">Sent</span>
        </div>
        <div className={`stepper-line ${isAccepted ? 'active' : ''}`}></div>
        <div className={`stepper-step ${isAccepted ? 'active' : ''}`}>
          <div className="stepper-dot"></div>
          <span className="stepper-label">Accepted</span>
        </div>
        <div className={`stepper-line ${isShipped ? 'active' : ''}`}></div>
        <div className={`stepper-step ${isShipped ? 'active' : ''}`}>
          <div className="stepper-dot"></div>
          <span className="stepper-label">Shipped</span>
        </div>
        <div className={`stepper-line ${isDelivered ? 'active' : ''} ${isDelivered ? 'delivered' : ''}`}></div>
        <div className={`stepper-step ${isDelivered ? 'active' : ''} ${isDelivered ? 'delivered' : ''}`}>
          <div className="stepper-dot"></div>
          <span className="stepper-label">Delivered</span>
        </div>
      </div>
    );
  };

  const getPriorityColor = (priority: Order['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'var(--danger)';
      case 'high':
        return 'var(--warning)';
      default:
        return 'var(--text-muted)';
    }
  };

  const handleSendComment = (e: React.FormEvent, orderId: string) => {
    e.preventDefault();
    if (!chatMessage.trim() || !activeDistributor) return;

    onAddComment(orderId, 'distributor', activeDistributor.name, chatMessage.trim());
    setChatMessage('');
  };

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="distributor-shell">
      {/* Sidebar: Switch active distributor */}
      <div className="distributor-sidebar">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">
          Select Distributor View
        </h4>
        
        {distributors.map((distributor) => {
          const isActive = distributor.id === activeDistributorId;
          const pendingCount = orders.filter(
            (o) => o.distributorId === distributor.id && (o.status === 'pending' || o.status === 'processing')
          ).length;
          
          return (
            <div
              key={distributor.id}
              onClick={() => {
                setActiveDistributorId(distributor.id);
                setOpenChatOrderId(null);
              }}
              className={`glass-card dist-nav-card ${isActive ? 'active' : ''}`}
            >
              <img
                src={distributor.avatar}
                alt={distributor.name}
                className="dist-nav-avatar"
              />
              <div className="dist-nav-info">
                <span className="dist-nav-name">{distributor.name}</span>
                <span className="dist-nav-rating flex items-center gap-1">
                  <Star size={10} fill="currentColor" />
                  {distributor.rating}
                  {pendingCount > 0 && (
                    <span 
                      style={{ 
                        marginLeft: '8px', 
                        background: 'var(--primary)', 
                        color: '#fff', 
                        padding: '1px 5px', 
                        borderRadius: '10px', 
                        fontSize: '9px',
                        fontWeight: 'bold'
                      }}
                    >
                      {pendingCount} Active
                    </span>
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="distributor-content">
        <div className="glass-card" style={{ padding: '20px' }}>
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h2 className="text-lg font-semibold">{activeDistributor?.name} Portal</h2>
              <p className="text-xs text-muted mt-1">{activeDistributor?.description}</p>
            </div>
            <div className="text-right text-xs text-muted">
              <div>Email: {activeDistributor?.email}</div>
              <div>Phone: {activeDistributor?.phone}</div>
            </div>
          </div>
        </div>

        {/* Distributor Orders List */}
        {distributorOrders.length === 0 ? (
          <div className="glass-card empty-state">
            <Package className="empty-state-icon" />
            <div>
              <p className="font-semibold text-sm">No orders received yet</p>
              <p className="text-xs text-muted mt-1">Orders sent to this distributor will appear here.</p>
            </div>
          </div>
        ) : (
          <div className="order-list">
            {distributorOrders.map((order) => {
              const isChatOpen = openChatOrderId === order.id;
              
              return (
                <div key={order.id} className="dist-order-row">
                  {/* Order Row Header */}
                  <div className="dist-order-header">
                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-sm">{order.id}</span>
                      <span className="text-xs text-muted">{formatDateTime(order.timestamp)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span 
                        className="text-xs font-semibold uppercase" 
                        style={{ color: getPriorityColor(order.priority) }}
                      >
                        Priority: {order.priority}
                      </span>
                      <span className={`badge badge-${order.status}`}>{order.status}</span>
                    </div>
                  </div>

                  {/* Order Row Body */}
                  <div className="dist-order-details">
                    <div 
                      className="dist-order-photo-container" 
                      onClick={() => setZoomPhotoUrl(order.photoData)}
                      title="Click to zoom image"
                    >
                      <img src={order.photoData} alt="Order snapshot" className="dist-order-photo" />
                    </div>

                    <div className="dist-order-main">
                      <p className="dist-order-notes">
                        <strong className="text-xs text-muted block mb-1">NOTES/INSTRUCTIONS FROM RETAILER:</strong>
                        {order.notes ? `"${order.notes}"` : 'No notes provided.'}
                      </p>
                      <div style={{ marginTop: '12px' }}>
                        {renderStepper(order.status)}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Chat Trigger Bar */}
                  <div className="dist-order-actions-bar">
                    <div className="status-step-container">
                      <span className="text-xs text-muted font-semibold mr-2">UPDATE STATUS:</span>
                      
                      {/* Step 1: Pending -> Processing or Cancelled */}
                      {order.status === 'pending' && (
                        <>
                          <button
                            onClick={() => onUpdateStatus(
                              order.id, 
                              'processing', 
                              'Order accepted by distributor and is now in processing.',
                              'distributor',
                              activeDistributor?.name
                            )}
                            className="status-step-btn primary flex items-center gap-1"
                          >
                            <CheckCircle size={12} />
                            Accept & Process
                          </button>
                          
                          <button
                            onClick={() => onUpdateStatus(
                              order.id, 
                              'cancelled', 
                              'Order rejected/cancelled by distributor.',
                              'distributor',
                              activeDistributor?.name
                            )}
                            className="status-step-btn text-danger flex items-center gap-1"
                          >
                            <XCircle size={12} />
                            Reject
                          </button>
                        </>
                      )}

                      {/* Step 2: Processing -> Shipped */}
                      {order.status === 'processing' && (
                        <button
                          onClick={() => onUpdateStatus(
                            order.id, 
                            'shipped', 
                            'Order packaged and shipped via delivery vehicle.',
                            'distributor',
                            activeDistributor?.name
                          )}
                          className="status-step-btn primary flex items-center gap-1"
                        >
                          <Truck size={12} />
                          Mark as Shipped
                        </button>
                      )}

                      {/* Step 3: Shipped -> Delivered */}
                      {order.status === 'shipped' && (
                        <button
                          onClick={() => onUpdateStatus(
                            order.id, 
                            'delivered', 
                            'Order delivered successfully and signed by consignee.',
                            'distributor',
                            activeDistributor?.name
                          )}
                          className="status-step-btn primary flex items-center gap-1"
                        >
                          <CheckCircle size={12} />
                          Mark as Delivered
                        </button>
                      )}

                      {/* Final States */}
                      {order.status === 'delivered' && (
                        <span className="text-xs text-muted flex items-center gap-1" style={{ color: 'var(--success)' }}>
                          <CheckCircle size={12} />
                          Delivered & Completed
                        </span>
                      )}

                      {order.status === 'cancelled' && (
                        <span className="text-xs text-muted flex items-center gap-1" style={{ color: 'var(--danger)' }}>
                          <XCircle size={12} />
                          Cancelled
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => setOpenChatOrderId(isChatOpen ? null : order.id)}
                      className={`footer-btn ${isChatOpen ? 'active' : ''}`}
                    >
                      <MessageCircle size={14} />
                      {isChatOpen ? 'Hide Discussion' : `Chat & Timeline (${order.comments.length})`}
                    </button>
                  </div>

                  {/* Accordion Chat Section */}
                  {isChatOpen && (
                    <div 
                      style={{ 
                        borderTop: '1px solid var(--border-color)', 
                        background: 'rgba(0,0,0,0.15)',
                        padding: '16px 20px'
                      }}
                    >
                      <div className="flex flex-col gap-3" style={{ maxHeight: '250px', overflowY: 'auto', marginBottom: '12px' }}>
                        {order.comments.map((comment) => (
                          <div 
                            key={comment.id} 
                            style={{ 
                              padding: '8px 12px',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '12px',
                              background: comment.author === 'distributor' ? 'rgba(139, 92, 246, 0.08)' : 'rgba(255, 255, 255, 0.04)',
                              border: '1px solid',
                              borderColor: comment.author === 'distributor' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                              maxWidth: '85%',
                              alignSelf: comment.author === 'distributor' ? 'flex-end' : 'flex-start'
                            }}
                          >
                            <div className="flex justify-between gap-4 font-semibold text-xs mb-1" style={{ fontSize: '10px' }}>
                              <span style={{ color: comment.author === 'distributor' ? 'var(--accent-purple)' : 'var(--primary)' }}>
                                {comment.authorName}
                              </span>
                              <span className="text-muted">{formatDateTime(comment.timestamp)}</span>
                            </div>
                            <div>{comment.message}</div>
                          </div>
                        ))}
                      </div>

                      {order.status !== 'cancelled' && (
                        <div className="quick-reply-wrapper" style={{ marginBottom: '12px' }}>
                          {QUICK_MESSAGES_DISTRIBUTOR.map((msg, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => onAddComment(order.id, 'distributor', activeDistributor?.name || 'Distributor', msg)}
                              className="quick-reply-chip"
                            >
                              {msg}
                            </button>
                          ))}
                        </div>
                      )}

                      <form onSubmit={(e) => handleSendComment(e, order.id)} className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Reply to retailer..."
                          value={chatMessage}
                          onChange={(e) => setChatMessage(e.target.value)}
                          className="modal-chat-input"
                          style={{ padding: '8px 12px', fontSize: '12px' }}
                          disabled={order.status === 'cancelled'}
                        />
                        <button
                          type="submit"
                          className="btn"
                          style={{ padding: '8px 16px', fontSize: '12px' }}
                          disabled={!chatMessage.trim() || order.status === 'cancelled'}
                        >
                          <Send size={12} />
                          Reply
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FULL PHOTO ZOOM MODAL */}
      {zoomPhotoUrl && (
        <div 
          className="detail-modal-backdrop" 
          onClick={() => setZoomPhotoUrl(null)}
          style={{ zIndex: 110 }}
        >
          <div 
            style={{ 
              maxWidth: '90%', 
              maxHeight: '90%', 
              position: 'relative' 
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setZoomPhotoUrl(null)} 
              className="control-icon-btn" 
              style={{ 
                position: 'absolute', 
                top: '-45px', 
                right: '0', 
                background: 'rgba(0,0,0,0.6)', 
                border: 'none' 
              }}
            >
              <X size={20} />
            </button>
            <img 
              src={zoomPhotoUrl} 
              alt="Zoomed order sheet" 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '80vh', 
                objectFit: 'contain',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 10px 50px rgba(0,0,0,0.9)'
              }} 
            />
          </div>
        </div>
      )}
    </div>
  );
};
