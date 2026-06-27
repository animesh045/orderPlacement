import React, { useState, useRef, useEffect } from 'react';
import { Camera, UploadCloud, RotateCcw, CameraOff, Check } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (photoData: string) => void;
  selectedPhoto: string | null;
  onClear: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  onCapture,
  selectedPhoto,
  onClear,
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stop camera stream when component unmounts or camera is deactivated
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Update video element source when stream changes
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (stream) {
        stopCamera();
      }
      
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setIsCameraActive(true);
    } catch (err: any) {
      console.error('Error accessing camera:', err);
      setCameraError(
        err.name === 'NotAllowedError' 
          ? 'Camera permission denied. Please allow camera access or upload an image.' 
          : 'Could not access camera. Make sure it is not in use by another app.'
      );
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  const toggleCameraFacing = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    // Restart camera with new facing mode if active
    if (isCameraActive) {
      setTimeout(() => {
        // Simple retrigger
        startCamera();
      }, 100);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        // Set canvas dimensions to match video source size
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        
        // Mirror the image if using front camera
        if (facingMode === 'user') {
          context.translate(canvas.width, 0);
          context.scale(-1, 1);
        }
        
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Reset scale if mirrored
        if (facingMode === 'user') {
          context.setTransform(1, 0, 0, 1, 0, 0);
        }
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        onCapture(dataUrl);
        stopCamera();
      }
    }
  };

  // Handle file uploads
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG/JPEG)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onCapture(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Drag and drop events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="camera-card">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted flex items-center gap-2">
          <Camera size={16} className="text-primary" />
          Order Capture
        </h3>
        
        {selectedPhoto && (
          <button onClick={onClear} className="footer-btn text-danger flex items-center gap-1 text-xs">
            <RotateCcw size={14} />
            Retake Photo
          </button>
        )}
      </div>

      <div className="camera-viewport">
        {selectedPhoto ? (
          // Captured/Selected Photo Preview
          <>
            <img src={selectedPhoto} alt="Order captured" className="camera-preview" />
            <div className="camera-status">
              <span className="status-dot"></span>
              Photo Ready
            </div>
            <div className="camera-controls">
              <div 
                className="control-icon-btn" 
                style={{ background: 'var(--success)', border: 'none' }}
                title="Photo Captured Successfully"
              >
                <Check size={20} />
              </div>
            </div>
          </>
        ) : isCameraActive ? (
          // Active Camera Stream
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="camera-video"
            />
            <div className="scan-line"></div>
            <div className="camera-status">
              <span className="status-dot"></span>
              Live Camera ({facingMode === 'user' ? 'Front' : 'Rear'})
            </div>
            <div className="camera-controls">
              <button 
                onClick={toggleCameraFacing} 
                className="control-icon-btn"
                title="Switch Camera"
              >
                <RotateCcw size={18} />
              </button>
              
              <button 
                onClick={capturePhoto} 
                className="shutter-btn"
                title="Take Photo"
              />
              
              <button 
                onClick={stopCamera} 
                className="control-icon-btn"
                title="Use File Upload"
              >
                <CameraOff size={18} />
              </button>
            </div>
          </>
        ) : (
          // Fallback File Drag-and-Drop / Trigger Camera Uploader
          <div 
            className={`file-uploader-fallback ${isDragOver ? 'dragover' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerFileSelect}
            style={isDragOver ? { borderColor: 'var(--primary)', background: 'rgba(59, 130, 246, 0.05)' } : {}}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*"
              className="file-uploader-input" 
            />
            
            <UploadCloud size={40} className="text-muted" style={{ opacity: 0.6 }} />
            
            <div>
              <p className="font-semibold text-sm">Drag & Drop Order Sheet Photo</p>
              <p className="text-xs text-muted mt-2">or click to browse local files</p>
            </div>

            <div className="flex gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
              <button 
                type="button" 
                onClick={startCamera} 
                className="btn btn-secondary text-xs flex items-center gap-1"
                style={{ padding: '6px 12px', borderRadius: 'var(--radius-sm)' }}
              >
                <Camera size={14} />
                Open Live Camera
              </button>
            </div>
          </div>
        )}
      </div>

      {cameraError && (
        <div 
          className="text-xs" 
          style={{ 
            color: 'var(--danger)', 
            background: 'var(--danger-bg)', 
            padding: '8px 12px', 
            borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(244, 63, 94, 0.2)' 
          }}
        >
          {cameraError}
        </div>
      )}

      {/* Hidden canvas for snapshot rasterization */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};
