'use client';
import React from 'react';
import Cropper from 'react-easy-crop';
import type { AvatarCropData } from '../../types/avatar.types';

interface AvatarCropperProps {
  image: string;
  crop: { x: number; y: number };
  zoom: number;
  aspect: number;
  rotation: number;
  onCropChange: (crop: { x: number; y: number }) => void;
  onZoomChange: (zoom: number) => void;
  onRotationChange: (rotation: number) => void;
  onCropComplete: (croppedArea: AvatarCropData) => void;
}

export default function AvatarCropper({
  image,
  crop,
  zoom,
  aspect,
  rotation,
  onCropChange,
  onZoomChange,
  onRotationChange,
  onCropComplete,
}: AvatarCropperProps) {
  // No ref needed for Cropper
  return (
    <div className='relative w-full h-80 bg-black/80'>
      <Cropper
        image={image}
        crop={crop}
        zoom={zoom}
        aspect={aspect}
        rotation={rotation}
        onCropChange={onCropChange}
        onZoomChange={onZoomChange}
        onRotationChange={onRotationChange}
        onCropComplete={(_, croppedAreaPixels) =>
          onCropComplete({ ...croppedAreaPixels, aspect, rotation })
        }
        cropShape='round'
        showGrid={false}
  // no ref
      />
    </div>
  );
}
