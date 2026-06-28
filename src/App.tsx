import { useState, useEffect } from 'react';
import { CameraCapture } from './components/CameraCapture';
import { OrderForm } from './components/OrderForm';
import { HistoryDashboard } from './components/HistoryDashboard';
import { WhatsAppAuth } from './components/WhatsAppAuth';
import { 
  getOrders, 
  addOrder, 
  toggleOrderStatus, 
  deleteOrder 
} from './utils/storage';
import type { Order } from './types';
import { Package, Zap } from 'lucide-react';

// Green API credentials from environment/Vercel settings
const ID_INSTANCE = import.meta.env.VITE_GREEN_API_ID_INSTANCE || '';
const API_TOKEN_INSTANCE = import.meta.env.VITE_GREEN_API_TOKEN_INSTANCE || '';
const API_URL = import.meta.env.VITE_GREEN_API_URL || 'https://api.green-api.com';
const isConfigured = !!(ID_INSTANCE && API_TOKEN_INSTANCE);

function App() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // WhatsApp integration states: starts loading if configured, or authorized for simulation
  const [waStatus, setWaStatus] = useState<
    'loading' | 'authorized' | 'notAuthorized' | 'sleepMode' | 'starting' | 'blocked' | 'disconnected'
  >(isConfigured ? 'loading' : 'authorized');
  const [waQrCode, setWaQrCode] = useState<string | null>(null);

  // Load orders and poll Green API status
  useEffect(() => {
    setOrders(getOrders());

    if (!isConfigured) return;

    const checkWhatsAppStatus = async () => {
      try {
        const res = await fetch(
          `${API_URL}/waInstance${ID_INSTANCE}/getStateInstance/${API_TOKEN_INSTANCE}`
        );
        const data = await res.json();
        const state = data.stateInstance; // "authorized" | "notAuthorized" | "sleepMode" | etc.
        setWaStatus(state);

        if (state === 'notAuthorized') {
          // Fetch QR Code
          const qrRes = await fetch(
            `${API_URL}/waInstance${ID_INSTANCE}/qr/${API_TOKEN_INSTANCE}`
          );
          const qrData = await qrRes.json();
          if (qrData.type === 'qrCode') {
            // Prepends standard PNG MIME header to the returned base64 string
            setWaQrCode(`data:image/png;base64,${qrData.message}`);
          }
        } else {
          setWaQrCode(null);
        }
      } catch (err) {
        setWaStatus('disconnected');
        setWaQrCode(null);
      }
    };

    checkWhatsAppStatus();
    const interval = setInterval(checkWhatsAppStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const triggerNotification = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handlePlaceOrder = async (orderData: { phone: string }) => {
    if (photos.length === 0) return;
    setIsSubmitting(true);

    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const formattedDate = new Date().toLocaleDateString('en-GB');
    const caption = `Ananya Enterprises - ${formattedDate}`;

    // 1. Add order to local history
    const newOrder: Order = {
      id: orderId,
      photos: [...photos],
      phone: orderData.phone,
      status: 'pending',
      timestamp: new Date().toISOString()
    };

    addOrder(newOrder);
    setOrders(getOrders());
    setPhotos([]); // Clear uploaded photos

    // 2. Dispatch via Green API (if keys are set and active)
    let waSent = false;
    if (isConfigured && waStatus === 'authorized') {
      try {
        let sentCount = 0;
        for (let i = 0; i < newOrder.photos.length; i++) {
          const recipientChatId = `${orderData.phone}@c.us`;
          const fileName = `order_${orderId}_${i + 1}.jpg`;

          // Convert data URL to binary Blob
          const blobRes = await fetch(newOrder.photos[i]);
          const fileBlob = await blobRes.blob();

          const formData = new FormData();
          formData.append('chatId', recipientChatId);
          formData.append('file', fileBlob, fileName);
          formData.append('fileName', fileName);
          formData.append('caption', caption);

          const res = await fetch(
            `${API_URL}/waInstance${ID_INSTANCE}/sendFileByUpload/${API_TOKEN_INSTANCE}`,
            {
              method: 'POST',
              body: formData
            }
          );
          const apiData = await res.json();
          if (apiData.idMessage) {
            sentCount++;
          }
        }
        if (sentCount === newOrder.photos.length) {
          waSent = true;
        }
      } catch (err) {
        console.error('Green API error:', err);
      }
    }

    setIsSubmitting(false);

    if (!isConfigured) {
      triggerNotification(`Order ${orderId} saved locally (Simulation Mode).`, 'info');
    } else if (waSent) {
      triggerNotification(`Order ${orderId} sent automatically via WhatsApp!`, 'success');
    } else {
      triggerNotification(`Order saved locally (WhatsApp offline or linking pending).`, 'info');
    }
  };

  const handleToggleStatus = (orderId: string) => {
    const updated = toggleOrderStatus(orderId);
    setOrders(updated);
    triggerNotification('Delivery status updated!', 'success');
  };

  const handleDeleteOrder = (orderId: string) => {
    const updated = deleteOrder(orderId);
    setOrders(updated);
    triggerNotification('Order record deleted.', 'info');
  };

  const handleResendOrder = async (order: Order) => {
    if (!isConfigured) {
      triggerNotification('Setup Green API credentials to enable WhatsApp sending.', 'info');
      return;
    }
    if (waStatus !== 'authorized') {
      triggerNotification('WhatsApp Gateway is offline. Link it first.', 'info');
      return;
    }

    setIsSubmitting(true);
    let sentCount = 0;
    const formattedDate = new Date(order.timestamp).toLocaleDateString('en-GB');
    const caption = `Ananya Enterprises - ${formattedDate}`;

    try {
      for (let i = 0; i < order.photos.length; i++) {
        const recipientChatId = `${order.phone}@c.us`;
        const fileName = `order_${order.id}_${i + 1}.jpg`;

        // Convert data URL to binary Blob
        const blobRes = await fetch(order.photos[i]);
        const fileBlob = await blobRes.blob();

        const formData = new FormData();
        formData.append('chatId', recipientChatId);
        formData.append('file', fileBlob, fileName);
        formData.append('fileName', fileName);
        formData.append('caption', caption);

        const res = await fetch(
          `${API_URL}/waInstance${ID_INSTANCE}/sendFileByUpload/${API_TOKEN_INSTANCE}`,
          {
            method: 'POST',
            body: formData
          }
        );
        const apiData = await res.json();
        if (apiData.idMessage) {
          sentCount++;
        }
      }
    } catch (err) {
      console.error(err);
    }

    setIsSubmitting(false);
    if (sentCount === order.photos.length) {
      triggerNotification('Order resent successfully via WhatsApp!', 'success');
    } else {
      triggerNotification('Resend failed or partially completed.', 'info');
    }
  };

  return (
    <div className="container" style={{ paddingBottom: '32px' }}>
      {/* Toast Notification */}
      {notification && (
        <div 
          style={{
            position: 'fixed',
            bottom: '24px',
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
            <h1>Ananya Enterprises <span className="gradient-text">OrderHub</span></h1>
            <p className="text-xs text-muted">Instant Photo-Based Order Placement</p>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* WhatsApp Link Banner */}
        <WhatsAppAuth 
          status={waStatus}
          qrCode={waQrCode}
          mode={isConfigured ? 'official' : 'simulation'}
        />

        <div className="main-grid">
          {/* Left Column: Capture & Form */}
          <div className="column">
            <CameraCapture 
              photos={photos}
              onAddPhoto={(p) => setPhotos(prev => [...prev, p])}
              onRemovePhoto={(index) => setPhotos(prev => prev.filter((_, i) => i !== index))}
              onClear={() => setPhotos([])}
            />
            
            <OrderForm 
              photosCount={photos.length}
              onSubmit={handlePlaceOrder}
              isSubmitting={isSubmitting}
            />
          </div>
          
          {/* Right Column: History */}
          <div className="column">
            <HistoryDashboard 
              orders={orders}
              onToggleStatus={handleToggleStatus}
              onDeleteOrder={handleDeleteOrder}
              onResendOrder={handleResendOrder}
            />
          </div>
        </div>
      </main>

      <footer className="text-center text-xs text-muted" style={{ marginTop: '32px', opacity: 0.5 }}>
        &copy; {new Date().getFullYear()} Ananya Enterprises OrderHub. Built for automated B2B order routing.
      </footer>
    </div>
  );
}

export default App;
