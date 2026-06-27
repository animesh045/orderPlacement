import { useState, useEffect } from 'react';
import { CameraCapture } from './components/CameraCapture';
import { OrderForm } from './components/OrderForm';
import { HistoryDashboard } from './components/HistoryDashboard';
import { DistributorPortal } from './components/DistributorPortal';
import { WhatsAppAuth } from './components/WhatsAppAuth';
import { 
  getOrders, 
  getDistributors, 
  addOrder, 
  updateOrderStatus, 
  addOrderComment 
} from './utils/storage';
import type { Order, Distributor } from './types';
import { Package, User, Landmark, Zap } from 'lucide-react';

function App() {
  const [activeView, setActiveView] = useState<'sender' | 'distributor'>('sender');
  const [orders, setOrders] = useState<Order[]>([]);
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // WhatsApp integration states
  const [waStatus, setWaStatus] = useState<'loading' | 'qr' | 'ready' | 'disconnected'>('loading');
  const [waQrCode, setWaQrCode] = useState<string | null>(null);

  // Load orders and distributors, and poll WhatsApp status
  useEffect(() => {
    setOrders(getOrders());
    setDistributors(getDistributors());

    const checkWhatsAppStatus = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/status');
        const data = await res.json();
        setWaStatus(data.status);

        if (data.status === 'qr') {
          const qrRes = await fetch('http://localhost:3001/api/qr');
          const qrData = await qrRes.json();
          setWaQrCode(qrData.qrCode);
        } else {
          setWaQrCode(null);
        }
      } catch (err) {
        setWaStatus('disconnected');
        setWaQrCode(null);
      }
    };

    checkWhatsAppStatus();
    const interval = setInterval(checkWhatsAppStatus, 4000);
    return () => clearInterval(interval);
  }, []);

  // Show a visual notification toast
  const triggerNotification = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Retailer places an order (local simulation + WhatsApp integration if linked)
  const handlePlaceOrder = async (orderData: {
    distributorId: string;
    notes: string;
    priority: Order['priority'];
    phone: string;
  }) => {
    if (!selectedPhoto) return;
    setIsSubmitting(true);

    const distName = distributors.find(d => d.id === orderData.distributorId)?.name || 'Distributor';
    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

    // 1. Save locally for timeline simulation
    const newOrder: Order = {
      id: orderId,
      photoData: selectedPhoto,
      distributorId: orderData.distributorId,
      notes: orderData.notes,
      priority: orderData.priority,
      status: 'pending',
      timestamp: new Date().toISOString(),
      comments: [
        {
          id: `comment-init-${Date.now()}`,
          author: 'retailer',
          authorName: 'Retailer (You)',
          message: `Order submitted to ${distName}. ${orderData.notes ? `Note: "${orderData.notes}"` : ''}`,
          timestamp: new Date().toISOString()
        }
      ]
    };

    addOrder(newOrder);
    setOrders(getOrders());
    setSelectedPhoto(null);

    // 2. Deliver via WhatsApp Web client API if ready
    let waSent = false;
    if (waStatus === 'ready') {
      try {
        const res = await fetch('http://localhost:3001/api/send-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            phone: orderData.phone,
            notes: orderData.notes,
            photoData: selectedPhoto,
            orderId: orderId
          })
        });
        const apiData = await res.json();
        if (apiData.success) {
          waSent = true;
        } else {
          console.warn('WhatsApp API error:', apiData.message);
        }
      } catch (err) {
        console.error('Error sending order photo to WhatsApp backend:', err);
      }
    }

    setIsSubmitting(false);

    if (waSent) {
      triggerNotification(`Order ${orderId} successfully sent to ${distName} via WhatsApp!`, 'success');
    } else {
      triggerNotification(`Order ${orderId} saved locally (WhatsApp offline/not linked).`, 'info');
    }
  };

  // Distributor updates status of an order
  const handleUpdateOrderStatus = (
    orderId: string,
    status: Order['status'],
    commentText?: string,
    authorRole: 'retailer' | 'distributor' = 'distributor',
    authorName: string = 'Distributor'
  ) => {
    const updated = updateOrderStatus(orderId, status, commentText, authorRole, authorName);
    setOrders(updated);
    triggerNotification(`Order ${orderId} marked as ${status.toUpperCase()}`, 'info');
  };

  // Add chat comment
  const handleAddComment = (
    orderId: string,
    author: 'retailer' | 'distributor',
    authorName: string,
    message: string
  ) => {
    const updated = addOrderComment(orderId, author, authorName, message);
    setOrders(updated);
  };

  // Cancel order (Retailer side)
  const handleCancelOrder = (orderId: string) => {
    const updated = updateOrderStatus(
      orderId, 
      'cancelled', 
      'Order cancelled by retailer.', 
      'retailer', 
      'Retailer (You)'
    );
    setOrders(updated);
    triggerNotification(`Order ${orderId} has been cancelled`, 'info');
  };

  // Count active pending tasks for distributors
  const activeOrdersCount = orders.filter(
    (o) => o.status === 'pending' || o.status === 'processing'
  ).length;

  return (
    <div className="app-container">
      {/* Toast Notification */}
      {notification && (
        <div 
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            background: notification.type === 'success' ? 'var(--success)' : 'var(--primary)',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5), var(--shadow-glow)',
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: '600',
            animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <Zap size={16} />
          {notification.message}
        </div>
      )}

      {/* Header Bar */}
      <header className="app-header">
        <div className="brand-section">
          <div className="brand-icon">
            <Package size={22} color="#fff" />
          </div>
          <div>
            <h1><span className="gradient-text">Antigravity</span> OrderHub</h1>
            <p className="text-xs text-muted">Instant Photo-Based Order Placement</p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="role-switcher">
          <button 
            onClick={() => setActiveView('sender')}
            className={`role-btn ${activeView === 'sender' ? 'active' : ''}`}
          >
            <User size={15} />
            Retailer View
          </button>
          
          <button 
            onClick={() => setActiveView('distributor')}
            className={`role-btn ${activeView === 'distributor' ? 'active' : ''}`}
          >
            <Landmark size={15} />
            Distributors
            {activeOrdersCount > 0 && (
              <span 
                style={{ 
                  background: activeView === 'distributor' ? 'rgba(255,255,255,0.2)' : 'var(--primary)', 
                  color: '#fff',
                  fontSize: '10px',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  fontWeight: '700'
                }}
              >
                {activeOrdersCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main>
        {activeView === 'sender' ? (
          // Retailer Dashboard Screen
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <WhatsAppAuth 
              status={waStatus}
              qrCode={waQrCode}
              onRefresh={async () => {
                setWaStatus('loading');
                try {
                  await fetch('http://localhost:3001/api/status');
                } catch(e) {}
              }}
            />
            
            <div className="main-grid">
            {/* Left Column: Form & Capture */}
            <div className="column">
              <CameraCapture 
                onCapture={setSelectedPhoto} 
                selectedPhoto={selectedPhoto}
                onClear={() => setSelectedPhoto(null)}
              />
              
              <OrderForm 
                distributors={distributors}
                selectedPhoto={selectedPhoto}
                onSubmit={handlePlaceOrder}
                isSubmitting={isSubmitting}
              />
            </div>
            
            {/* Right Column: List & Tracker */}
            <div className="column">
              <HistoryDashboard 
                orders={orders}
                distributors={distributors}
                onCancelOrder={handleCancelOrder}
                onAddComment={handleAddComment}
              />
            </div>
          </div>
        </div>
        ) : (
          // Distributor portal screen
          <DistributorPortal 
            orders={orders}
            distributors={distributors}
            onUpdateStatus={handleUpdateOrderStatus}
            onAddComment={handleAddComment}
          />
        )}
      </main>

      <footer className="text-center text-xs text-muted" style={{ marginTop: '32px', opacity: 0.5 }}>
        &copy; {new Date().getFullYear()} Antigravity Order Placement. Built for fast B2B retail transactions.
      </footer>
    </div>
  );
}

export default App;
