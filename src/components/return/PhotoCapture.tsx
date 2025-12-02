import React, { useState, useRef } from 'react';
import { Camera, X, Check, Trash2 } from 'lucide-react';
import { Button } from '@/design/components';

interface PhotoCaptureProps {
  onPhotoTaken: (photoData: string) => void;
  onCancel: () => void;
  existingPhoto?: string;
}

/**
 * US V.2: Фотофиксация
 * Компонент для фотографирования поврежденных товаров
 */
export const PhotoCapture: React.FC<PhotoCaptureProps> = ({
  onPhotoTaken,
  onCancel,
  existingPhoto,
}) => {
  const [photo, setPhoto] = useState<string | null>(existingPhoto || null);
  const [useCamera, setUseCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Открыть камеру
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Задняя камера на мобильных
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
      setUseCamera(true);
    } catch (error) {
      console.error('Camera access denied:', error);
      alert('Не удалось получить доступ к камере');
    }
  };

  // Остановить камеру
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setUseCamera(false);
  };

  // Сделать фото
  const takePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const photoData = canvas.toDataURL('image/jpeg', 0.8);
        setPhoto(photoData);
        stopCamera();
      }
    }
  };

  // Загрузить из галереи
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhoto(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirm = () => {
    if (photo) {
      onPhotoTaken(photo);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
      <div className="bg-surface-primary rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-borders-default flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Camera size={24} />
            Фотофиксация
          </h2>
          <button
            onClick={() => {
              stopCamera();
              onCancel();
            }}
            className="p-2 hover:bg-surface-secondary rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-4">
          {/* Видео или фото */}
          <div className="aspect-video bg-surface-tertiary rounded-lg overflow-hidden mb-4">
            {useCamera ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : photo ? (
              <img src={photo} alt="Captured" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-content-tertiary">
                <div className="text-center">
                  <Camera size={48} className="mx-auto mb-2 opacity-50" />
                  <p>Нет фото</p>
                </div>
              </div>
            )}
          </div>

          {/* Действия */}
          <div className="space-y-3">
            {useCamera ? (
              <>
                <Button onClick={takePhoto} className="w-full" size="lg">
                  <Camera className="mr-2" />
                  Сделать фото
                </Button>
                <Button onClick={stopCamera} variant="secondary" className="w-full">
                  Отмена
                </Button>
              </>
            ) : photo ? (
              <>
                <Button onClick={handleConfirm} className="w-full" size="lg">
                  <Check className="mr-2" />
                  Подтвердить фото
                </Button>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => setPhoto(null)}
                    variant="secondary"
                    className="w-full"
                  >
                    <Trash2 size={16} className="mr-2" />
                    Удалить
                  </Button>
                  <Button onClick={startCamera} variant="secondary" className="w-full">
                    <Camera size={16} className="mr-2" />
                    Переснять
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Button onClick={startCamera} className="w-full" size="lg">
                  <Camera className="mr-2" />
                  Открыть камеру
                </Button>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="secondary"
                  className="w-full"
                >
                  Выбрать из галереи
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};



