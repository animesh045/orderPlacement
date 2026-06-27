import React, { useState } from 'react';
import type { Order, Distributor } from '../types';
import { Search, Filter, MessageSquare, Trash2, Calendar, ShieldAlert, X, Send, Eye } from 'lucide-react';

interface HistoryDashboardProps {
  orders: Order[];
  distributors: Distributor[];
  onCancelOrder: (orderId: string) => void;
  onAddComment: (orderId: string, author: 'retailer' | 'distributor', name: string, message: string) => void;
}

export const HistoryDashboard: React.FC<HistoryDashboardProps> = ({
  orders,
  distributors,
  onCancelOrder,
  onAddComment,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState<string>('');

  const activeOrder = orders.find((o) => o.id === selectedOrderId);
  const activeDistributor = activeOrder
    ? distributors.find((d) => d.id === activeOrder.distributorId)
    : null;

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const distributor = distributors.find((d) => d.id === order.distributorId);
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (distributor && distributor.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const QUICK_MESSAGES_RETAILER = [
    "Any updates on my order?",
    "Is everything in stock?",
    "Please expedite if possible!",
    "Thank you!"
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
      <div className="status-stepper">
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

  const getPriorityBadgeStyle = (priority: Order['priority']) => {
    switch (priority) {
      case 'urgent':
        return { background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid rgba(244, 63, 94, 0.2)' };
      case 'high':
        return { background: 'var(--warning-bg)', color: 'var(--warning)', border: '1px solid rgba(245, 158, 11, 0.2)' };
      default:
        return { background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' };
    }
  };

  const getStatusBadgeClass = (status: Order['status']) => {
    return `badge badge-${status}`;
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedOrderId) return;
    
    // Add comment as retailer
    onAddComment(selectedOrderId, 'retailer', 'Retailer (You)', newComment.trim());
    setNewComment('');
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
    <div className="glass-card flex flex-col gap-4">
      {/* Dashboard Top Header */}
      <div className="dashboard-header">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted flex items-center gap-2">
          <Calendar size={16} className="text-primary" />
          Order History & Tracking
        </h3>
        
        {/* Filters */}
        <div className="filters-wrapper">
          <div className="flex items-center gap-2" style={{ position: 'relative' }}>
            <Search 
              size={14} 
              className="text-muted" 
              style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} 
            />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input search-input"
              style={{ paddingLeft: '32px', height: '36px', fontSize: '13px' }}
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={14} className="text-muted" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="distributor-badge-select"
              style={{ height: '36px', fontSize: '13px' }}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="empty-state">
          <ShieldAlert className="empty-state-icon" />
          <div>
            <p className="font-semibold text-sm">No orders found</p>
            <p className="text-xs text-muted mt-1">Try resetting filters or capture a new order.</p>
          </div>
        </div>
      ) : (
        <div className="order-list">
          {filteredOrders.map((order) => {
            const distributor = distributors.find((d) => d.id === order.distributorId);
            return (
              <div key={order.id} className="glass-card order-card">
                {/* Order Image Thumbnail */}
                <div 
                  className="order-card-img-container"
                  onClick={() => setSelectedOrderId(order.id)}
                >
                  <img src={order.photoData} alt={`Order ${order.id}`} className="order-card-img" />
                  <div className="zoom-overlay">
                    <Eye size={20} />
                  </div>
                </div>

                {/* Order Info */}
                <div className="order-card-content">
                  <div className="order-card-header">
                    <div className="order-id-date">
                      <div className="order-id">{order.id}</div>
                      <div className="order-date">{formatDateTime(order.timestamp)}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span 
                        className="badge text-xs" 
                        style={getPriorityBadgeStyle(order.priority)}
                      >
                        {order.priority}
                      </span>
                      <span className={getStatusBadgeClass(order.status)}>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  <div className="order-card-middle">
                    <div className="order-distributor-info">
                      <span className="order-distributor-dot"></span>
                      <span className="font-semibold">{distributor ? distributor.name : 'Unknown Distributor'}</span>
                    </div>
                    {order.notes && (
                      <p className="order-notes-preview">"{order.notes}"</p>
                    )}
                    {renderStepper(order.status)}
                  </div>

                  <div className="order-card-footer">
                    <div className="text-xs text-muted">
                      {order.comments.length} Update{order.comments.length !== 1 ? 's' : ''}
                    </div>
                    
                    <div className="footer-actions">
                      <button 
                        onClick={() => setSelectedOrderId(order.id)}
                        className="footer-btn active"
                      >
                        <MessageSquare size={14} />
                        View Timeline & Chat
                      </button>

                      {order.status === 'pending' && (
                        <button 
                          onClick={() => onCancelOrder(order.id)}
                          className="footer-btn text-danger"
                          title="Cancel Order"
                        >
                          <Trash2 size={14} />
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TIMELINE / CHAT DETAIL MODAL */}
      {selectedOrderId && activeOrder && (
        <div className="detail-modal-backdrop" onClick={() => setSelectedOrderId(null)}>
          <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
            
            {/* Left side: Photo View */}
            <div className="modal-left">
              <div className="modal-image-wrapper">
                <img src={activeOrder.photoData} alt="Full Order sheet" className="modal-image" />
              </div>
              <div className="modal-meta-bar">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-sm font-semibold">{activeOrder.id}</h4>
                    <p className="text-xs text-muted">Submitted {formatDateTime(activeOrder.timestamp)}</p>
                  </div>
                  <span className={getStatusBadgeClass(activeOrder.status)}>
                    {activeOrder.status}
                  </span>
                </div>
                
                {/* Visual Status Stepper in Modal */}
                <div style={{ margin: '16px 0', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '12px 0' }}>
                  <p className="text-xs font-semibold text-muted uppercase mb-2">Delivery Track</p>
                  {renderStepper(activeOrder.status)}
                </div>
                
                {activeDistributor && (
                  <div className="mt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                    <p className="text-xs font-semibold text-muted uppercase">Distributor Contact</p>
                    <p className="text-sm font-semibold mt-1">{activeDistributor.name}</p>
                    <p className="text-xs text-muted mt-1">{activeDistributor.phone} • {activeDistributor.email}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right side: Chat timeline */}
            <div className="modal-right">
              <div className="modal-header">
                <div>
                  <h4 className="text-sm font-semibold">Order Timeline & Replies</h4>
                  <p className="text-xs text-muted">Real-time discussion with distributor</p>
                </div>
                <button 
                  onClick={() => setSelectedOrderId(null)} 
                  className="control-icon-btn" 
                  style={{ background: 'transparent', border: 'none' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Chat Timeline list */}
              <div className="modal-comments-area">
                <div 
                  className="text-xs text-center text-muted"
                  style={{ 
                    borderBottom: '1px solid rgba(255,255,255,0.05)', 
                    paddingBottom: '12px',
                    fontStyle: 'italic'
                  }}
                >
                  {activeOrder.notes ? `Initial Note: "${activeOrder.notes}"` : 'No initial instructions provided.'}
                </div>

                {activeOrder.comments.length === 0 ? (
                  <div className="empty-state" style={{ padding: '24px 0' }}>
                    <MessageSquare className="empty-state-icon" style={{ width: '32px', height: '32px' }} />
                    <p className="text-xs text-muted">No timeline comments yet.</p>
                  </div>
                ) : (
                  activeOrder.comments.map((comment) => (
                    <div 
                      key={comment.id} 
                      className={`message-bubble ${comment.author}`}
                    >
                      <div className="message-header">
                        <span className="name">{comment.authorName}</span>
                        <span className="time">{formatDateTime(comment.timestamp)}</span>
                      </div>
                      <div className="message-text">{comment.message}</div>
                    </div>
                  ))
                )}
              </div>

              {/* Chat Input form with Quick Replies */}
              <div 
                style={{ 
                  padding: '16px 24px', 
                  borderTop: '1px solid var(--border-color)', 
                  background: 'rgba(15, 23, 42, 0.5)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                {activeOrder.status !== 'cancelled' && (
                  <div className="quick-reply-wrapper">
                    {QUICK_MESSAGES_RETAILER.map((msg, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => onAddComment(activeOrder.id, 'retailer', 'Retailer (You)', msg)}
                        className="quick-reply-chip"
                      >
                        {msg}
                      </button>
                    ))}
                  </div>
                )}
                
                <form onSubmit={handleSendComment} style={{ display: 'flex', gap: '12px', width: '100%' }}>
                  <input
                    type="text"
                    placeholder="Ask distributor a question..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="modal-chat-input"
                    disabled={activeOrder.status === 'cancelled'}
                  />
                  <button 
                    type="submit" 
                    className="btn" 
                    style={{ padding: '10px 16px' }}
                    disabled={!newComment.trim() || activeOrder.status === 'cancelled'}
                  >
                    <Send size={14} />
                    Send
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
