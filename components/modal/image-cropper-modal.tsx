'use client'

import React, { useState, useCallback, useRef } from 'react'
import Cropper, { Area } from 'react-easy-crop'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Camera, Upload, X, Check, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'

interface ImageCropperModalProps {
  isOpen: boolean
  onClose: () => void
  onCropComplete: (croppedImage: Blob) => void
}

export function ImageCropperModal({ isOpen, onClose, onCropComplete }: ImageCropperModalProps) {
  const [image, setImage] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [mode, setMode] = useState<'select' | 'crop' | 'camera'>('select')
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const onCropChange = (crop: { x: number; y: number }) => {
    setCrop(crop)
  }

  const onZoomChange = (zoom: number) => {
    setZoom(zoom)
  }

  const onCropCompleteInternal = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setImage(reader.result as string)
        setMode('crop')
      }
      reader.readAsDataURL(file)
    }
  }

  const startCamera = async () => {
    setMode('camera')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err) {
      console.error('Error accessing camera:', err)
      toast.error('Tidak dapat mengakses kamera')
      setMode('select')
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      const tracks = stream.getTracks()
      tracks.forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
  }

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas')
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      const ctx = canvas.getContext('2d')
      ctx?.drawImage(videoRef.current, 0, 0)
      const dataUrl = canvas.toDataURL('image/jpeg')
      setImage(dataUrl)
      stopCamera()
      setMode('crop')
    }
  }

  const getCroppedImg = async () => {
    if (!image || !croppedAreaPixels) return

    const canvas = document.createElement('canvas')
    const img = new Image()
    img.src = image
    
    await new Promise((resolve) => {
      img.onload = resolve
    })

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = croppedAreaPixels.width
    canvas.height = croppedAreaPixels.height

    ctx.drawImage(
      img,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    )

    canvas.toBlob((blob) => {
      if (blob) {
        onCropComplete(blob)
        handleClose()
      }
    }, 'image/jpeg', 0.9)
  }

  const handleClose = () => {
    stopCamera()
    setImage(null)
    setMode('select')
    setZoom(1)
    setCrop({ x: 0, y: 0 })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Update Foto Profil</DialogTitle>
        </DialogHeader>

        <div className="relative mt-4 min-h-[350px] bg-muted/30 rounded-lg flex items-center justify-center overflow-hidden">
          {mode === 'select' && (
            <div className="flex flex-col gap-4 w-full p-8">
              <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="h-24 flex flex-col gap-2">
                <Upload className="w-8 h-8 text-primary" />
                <span>Unggah dari Perangkat</span>
              </Button>
              <Button onClick={startCamera} variant="outline" className="h-24 flex flex-col gap-2">
                <Camera className="w-8 h-8 text-primary" />
                <span>Ambil dari Kamera</span>
              </Button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
          )}

          {mode === 'camera' && (
            <div className="relative w-full h-full flex flex-col items-center">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-[300px] object-cover bg-black"
              />
              <div className="absolute bottom-4 flex gap-4">
                <Button onClick={capturePhoto} size="icon" className="rounded-full w-12 h-12">
                  <Camera className="w-6 h-6" />
                </Button>
                <Button onClick={() => { stopCamera(); setMode('select'); }} variant="secondary" size="icon" className="rounded-full w-12 h-12">
                  <X className="w-6 h-6" />
                </Button>
              </div>
            </div>
          )}

          {mode === 'crop' && image && (
            <div className="w-full h-full flex flex-col">
              <div className="relative w-full h-[300px]">
                <Cropper
                  image={image}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={onCropChange}
                  onCropComplete={onCropCompleteInternal}
                  onZoomChange={onZoomChange}
                  cropShape="round"
                  showGrid={false}
                />
              </div>
              <div className="p-4 bg-background border-t">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-xs font-medium">Zoom</span>
                  <Slider
                    value={[zoom]}
                    min={1}
                    max={3}
                    step={0.1}
                    onValueChange={(vals) => setZoom(vals[0])}
                    className="flex-1"
                  />
                </div>
                <div className="flex justify-between items-center">
                   <Button variant="ghost" size="sm" onClick={() => setMode('select')}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Ulangi
                   </Button>
                   <div className="flex gap-2">
                     <Button variant="outline" size="sm" onClick={handleClose}>Batal</Button>
                     <Button size="sm" onClick={getCroppedImg}>
                       <Check className="w-4 h-4 mr-2" />
                       Terapkan
                     </Button>
                   </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
