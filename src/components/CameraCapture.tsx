import React, { useRef, useState } from 'react';
import { Camera, Upload, X, Check } from 'lucide-react';

interface CameraCaptureProps {
  photos: string[];
  onAddPhoto: (photo: string) => void;
  onRemovePhoto: (index: number) => void;
  onClear: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  photos,
  onAddPhoto,
  onRemovePhoto,
  onClear,
}) => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Open device camera in a small overlay
  const startCamera = async () => {
    setIsCameraOpen(true);
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Back camera preferred for sheets
        audio: false
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error('Camera access failed:', err);
      setCameraError('Permission denied or camera not available.');
    }
  };

  // Close device camera
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
    }
    setCameraStream(null);
    setIsCameraOpen(false);
  };

  // Take snapshot
  const captureSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      onAddPhoto(dataUrl);
    }
    stopCamera();
  };

  // Handle local file uploads
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onAddPhoto(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div 
      className="glass-card" 
      style={{ 
        padding: '16px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '12px',
        background: 'rgba(30, 41, 59, 0.5)'
      }}
    >
      {/* Small title & clear button */}
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-semibold">Order Photos ({photos.length})</h4>
        {photos.length > 0 && (
          <button 
            onClick={onClear}
            className="text-xs text-muted"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}
          >
            Clear All
          </button>
        )}
      </div>

      {/* Compact horizontal thumbnails scroll list */}
      {photos.length === 0 ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          style={{ 
            height: '60px',
            border: '1.5px dashed rgba(255,255,255,0.08)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            background: 'rgba(0,0,0,0.1)'
          }}
        >
          No photos added. Click Upload to start.
        </div>
      ) : (
        <div 
          style={{ 
            display: 'flex', 
            gap: '8px', 
            overflowX: 'auto',
            paddingBottom: '4px'
          }}
        >
          {photos.map((photo, index) => (
            <div 
              key={index} 
              style={{ 
                position: 'relative', 
                width: '60px', 
                height: '60px', 
                flexShrink: 0 
              }}
            >
              <img 
                src={photo} 
                alt={`Selected item ${index + 1}`} 
                style={{ 
                  width: '60px', 
                  height: '60px', 
                  objectFit: 'cover', 
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              />
              <button
                onClick={() => onRemovePhoto(index)}
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: 'var(--danger)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '50%',
                  width: '16px',
                  height: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
                  padding: 0
                }}
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Button Row - Very Compact */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <button 
          onClick={startCamera}
          className="btn btn-secondary text-xs flex items-center justify-center gap-1.5"
          style={{ padding: '8px 12px' }}
        >
          <Camera size={14} />
          Camera
        </button>

        <button 
          onClick={() => fileInputRef.current?.click()}
          className="btn btn-secondary text-xs flex items-center justify-center gap-1.5"
          style={{ padding: '8px 12px' }}
        >
          <Upload size={14} />
          Upload Files
        </button>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        multiple 
        accept="image/*" 
        style={{ display: 'none' }}
      />

      {/* Toggled Camera Overlay Modal (to keep layout short) */}
      {isCameraOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.9)',
            zIndex: 1100,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            gap: '16px'
          }}
        >
          <div 
            style={{ 
              position: 'relative', 
              width: '100%', 
              maxWidth: '480px', 
              borderRadius: 'var(--radius-md)', 
              overflow: 'hidden',
              background: '#000'
            }}
          >
            {cameraError ? (
              <div className="text-center text-xs text-muted" style={{ padding: '40px', color: 'var(--danger)' }}>
                {cameraError}
              </div>
            ) : (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                style={{ width: '100%', display: 'block', transform: 'scaleX(1)' }}
              />
            )}
            
            <button 
              onClick={stopCamera}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'rgba(0,0,0,0.5)',
                border: 'none',
                color: '#fff',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>
          </div>

          {!cameraError && (
            <div className="flex gap-4">
              <button 
                onClick={captureSnapshot}
                className="btn btn-primary flex items-center gap-1.5"
                style={{ borderRadius: '50px', padding: '10px 24px' }}
              >
                <Check size={18} />
                Capture
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
