'use client';
import React, { useRef, useState } from 'react';
import { useAvatarUpload } from '../../hooks/use-avatar-upload';
import AvatarCropper from './avatar-cropper';
import Modal from '../ui/Modal';
import { getCroppedImg } from '../../utils/crop-utils';
import AvatarPreview from './avatar-preview';
import { AvatarError, AvatarCropData } from '../../types/avatar.types';

const fallbackColors = [
  'bg-blue-500',
  'bg-green-500',
  'bg-red-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-indigo-500',
];

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

interface AvatarUploadProps {
  userName?: string;
  onUpload?: (result: unknown) => void;
}

export default function AvatarUpload({
  userName = 'User',
  onUpload,
}: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [aspect] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [showUploaded, setShowUploaded] = useState(false);
  const {
    error,
    uploading,
    preview,
    result,
    handleUpload,
    showCropModal,
    cropImage,
    confirmCrop,
  } = useAvatarUpload();

  // Notify parent when upload result changes
  React.useEffect(() => {
    if (result && onUpload) {
      onUpload(result);
    }
  }, [result, onUpload]);

  // Animate upload progress from 1 to 100% in 4 seconds, then show 'uploaded' for 500ms
  React.useEffect(() => {
    if (uploading) {
      setProgress(1);
      setShowUploaded(false);
      let current = 1;
      const interval = setInterval(() => {
        current += 1;
        setProgress(current);
        if (current >= 100) {
          clearInterval(interval);
          setShowUploaded(true);
          setTimeout(() => {
            setShowUploaded(false);
          }, 500);
        }
      }, 4000 / 99); // 99 steps from 1 to 100 in 4s
      return () => clearInterval(interval);
    } else {
      setProgress(0);
    }
  }, [uploading]);

  const handleFile = (file: File) => {
    handleUpload(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  // Set cropped area pixels when cropping is complete
  const handleCropComplete = (croppedArea: AvatarCropData) => {
    setCroppedAreaPixels(croppedArea);
  };

  const fallbackColor =
    fallbackColors[userName.charCodeAt(0) % fallbackColors.length];

  return (
    <div className='flex flex-col items-center w-full max-w-md mx-auto'>
      <div
        className={`w-40 h-40 rounded-full border-4 border-dashed flex items-center justify-center cursor-pointer transition-colors duration-200 ${
          dragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 bg-gray-100'
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragActive(false);
        }}
        onDrop={handleDrop}
      >
        {preview ? (
          <AvatarPreview src={preview} />
        ) : (
          <div
            className={`w-full h-full flex items-center justify-center rounded-full ${fallbackColor}`}
          >
            <span className='text-4xl text-white font-bold'>
              {getInitials(userName)}
            </span>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type='file'
        accept='image/png,image/jpeg,image/webp,image/svg+xml'
        className='hidden'
        onChange={handleChange}
      />
      {uploading && (
        <div className='w-full mt-2'>
          <div className='h-2 bg-gray-200 rounded-full overflow-hidden'>
            <div
              className='h-full bg-blue-500 transition-all'
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className='text-xs text-gray-500 mt-1'>
            {progress < 100 ? `Uploading... ${progress}%` : 'Uploading... 100%'}
          </div>
        </div>
      )}
      {showUploaded && (
        <div className='text-green-600 mt-2 text-sm font-semibold'>uploaded</div>
      )}
      {error && (
        <div className='text-red-500 mt-2 text-sm'>
          {(error as AvatarError).message}
        </div>
      )}

      {/* Cropping Modal */}
      {showCropModal && cropImage && (
        <Modal>
          <div
            className='p-8 bg-white rounded shadow-lg w-full max-w-2xl flex flex-col items-center'
            style={{ minWidth: 480, minHeight: 600 }}
          >
            <h2 className='text-2xl font-semibold mb-6 w-full text-center'>
              Crop your avatar
            </h2>
            <div className='w-full flex flex-col items-center'>
              <div className='relative w-[400px] h-[400px] bg-black/80 rounded mb-8 flex items-center justify-center'>
                <AvatarCropper
                  image={cropImage}
                  crop={crop}
                  zoom={zoom}
                  aspect={aspect}
                  rotation={rotation}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onRotationChange={setRotation}
                  onCropComplete={handleCropComplete}
                />
              </div>
              <div className='w-full max-w-[400px] mb-4'>
                <label className='flex items-center justify-between text-sm text-gray-600 mb-2'>
                  <span>Zoom</span>
                  <span className='ml-2 text-xs text-gray-500'>{Math.round(zoom * 100)}%</span>
                </label>
                <input
                  type='range'
                  min={1}
                  max={3}
                  step={0.01}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className='w-full'
                />
              </div>
              <button
                className='w-full py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-lg font-semibold'
                style={{ maxWidth: 350 }}
                onClick={async () => {
                  if (!croppedAreaPixels || !cropImage) return;
                  const croppedBlob = await getCroppedImg(
                    cropImage,
                    croppedAreaPixels,
                    rotation
                  );
                  const croppedFile = new File(
                    [croppedBlob],
                    'avatar-cropped.png',
                    { type: croppedBlob.type }
                  );
                  confirmCrop(croppedFile);
                }}
              >
                Confirm Crop
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
