'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import { Upload, Star, Trash2, ImagePlus, Loader2, AlertCircle } from 'lucide-react'

interface ProductImage {
  id: string
  url: string
  publicId: string
  altText: string | null
  sortOrder: number
  isDefault: boolean
}

interface Props {
  productId: string
}

export default function ImageManager({ productId }: Props) {
  const [images,     setImages]     = useState<ProductImage[]>([])
  const [uploading,  setUploading]  = useState(false)
  const [uploadPct,  setUploadPct]  = useState(0)
  const [error,      setError]      = useState('')
  const [cloudError, setCloudError] = useState('')
  const [dragging,   setDragging]   = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load existing images
  useEffect(() => {
    fetch('/api/admin/products/' + productId + '/images')
      .then(r => r.json())
      .then(d => setImages(d.data ?? []))
      .catch(() => setError('Failed to load images'))
  }, [productId])

  // Upload a single file to Cloudinary then save record
  const uploadFile = useCallback(async (file: File) => {
    // 1. Get signature from our server
    const signRes = await fetch('/api/admin/cloudinary-sign')
    const sign    = await signRes.json()
    if (!signRes.ok) {
      setCloudError(sign.error ?? 'Cloudinary not configured')
      return
    }

    // 2. Upload to Cloudinary directly (browser → Cloudinary)
    const formData = new FormData()
    formData.append('file',      file)
    formData.append('api_key',   sign.apiKey)
    formData.append('timestamp', String(sign.timestamp))
    formData.append('signature', sign.signature)
    formData.append('folder',    sign.folder)

    const xhr = new XMLHttpRequest()
    const uploadUrl = 'https://api.cloudinary.com/v1_1/' + sign.cloudName + '/image/upload'

    await new Promise<void>((resolve, reject) => {
      xhr.open('POST', uploadUrl)
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setUploadPct(Math.round((e.loaded / e.total) * 90))
      }
      xhr.onload = async () => {
        if (xhr.status !== 200) { reject(new Error('Upload failed')); return }
        const result = JSON.parse(xhr.responseText)

        // 3. Save image record in our DB
        setUploadPct(95)
        const saveRes = await fetch('/api/admin/products/' + productId + '/images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: result.secure_url, publicId: result.public_id, altText: '' }),
        })
        const saved = await saveRes.json()
        if (saved.data) setImages(prev => [...prev, saved.data])
        setUploadPct(100)
        resolve()
      }
      xhr.onerror = () => reject(new Error('Network error'))
      xhr.send(formData)
    })
  }, [productId])

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setError(''); setCloudError(''); setUploading(true); setUploadPct(0)
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue
        setUploadPct(0)
        await uploadFile(file)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false); setUploadPct(0)
    }
  }

  async function setDefault(imageId: string) {
    await fetch('/api/admin/products/' + productId + '/images/' + imageId, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isDefault: true }),
    })
    setImages(prev => prev.map(img => ({ ...img, isDefault: img.id === imageId })))
  }

  async function deleteImage(imageId: string) {
    if (!confirm('Delete this image? This cannot be undone.')) return
    const res = await fetch('/api/admin/products/' + productId + '/images/' + imageId, { method: 'DELETE' })
    if (res.ok) {
      setImages(prev => {
        const remaining = prev.filter(img => img.id !== imageId)
        // If no image is default after deletion, promote first
        if (remaining.length > 0 && !remaining.some(img => img.isDefault)) {
          remaining[0] = { ...remaining[0], isDefault: true }
        }
        return remaining
      })
    } else {
      setError('Failed to delete image')
    }
  }

  async function updateAlt(imageId: string, altText: string) {
    await fetch('/api/admin/products/' + productId + '/images/' + imageId, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ altText }),
    })
    setImages(prev => prev.map(img => img.id === imageId ? { ...img, altText } : img))
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Product Images</h2>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
          {uploading ? 'Uploading...' : 'Upload Images'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
      </div>

      {/* Cloudinary not configured warning */}
      {cloudError && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Cloudinary not configured</p>
            <p className="mt-0.5">{cloudError}</p>
            <p className="mt-1 text-amber-700">Add these to your <code className="bg-amber-100 px-1 rounded">.env.local</code>:</p>
            <pre className="mt-1 bg-amber-100 p-2 rounded text-[10px] leading-relaxed">{`CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name`}</pre>
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
      )}

      {/* Upload progress */}
      {uploading && (
        <div className="space-y-1">
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-300"
              style={{ width: uploadPct + '%' }}
            />
          </div>
          <p className="text-xs text-gray-400 text-right">{uploadPct}%</p>
        </div>
      )}

      {/* Drag-drop zone (shown when no images) */}
      {images.length === 0 && !uploading && (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
            dragging ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
          }`}
        >
          <Upload className="h-8 w-8 mx-auto text-gray-300 mb-3" />
          <p className="text-sm font-medium text-gray-500">Drag & drop images here</p>
          <p className="text-xs text-gray-400 mt-1">or click to browse — JPG, PNG, WebP</p>
        </div>
      )}

      {/* Image grid */}
      {images.length > 0 && (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
          className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-2 rounded-xl border-2 border-dashed transition-colors ${
            dragging ? 'border-indigo-300 bg-indigo-50' : 'border-transparent'
          }`}
        >
          {images.map((img) => (
            <div key={img.id} className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.altText ?? ''} className="w-full h-full object-cover" />

              {/* Default badge */}
              {img.isDefault && (
                <span className="absolute top-1.5 left-1.5 bg-amber-400 text-white text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full">
                  Default
                </span>
              )}

              {/* Hover actions overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                {!img.isDefault && (
                  <button
                    type="button"
                    onClick={() => setDefault(img.id)}
                    title="Set as default"
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-400 text-white text-[10px] font-semibold rounded-full hover:bg-amber-500 transition-colors"
                  >
                    <Star className="h-3 w-3" /> Set default
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => deleteImage(img.id)}
                  title="Delete image"
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500 text-white text-[10px] font-semibold rounded-full hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="h-3 w-3" /> Delete
                </button>
              </div>

              {/* Alt text input — bottom bar */}
              <div className="absolute bottom-0 inset-x-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1">
                <input
                  type="text"
                  defaultValue={img.altText ?? ''}
                  placeholder="Alt text..."
                  className="w-full text-[10px] bg-transparent text-white placeholder-white/50 outline-none border-b border-white/30"
                  onBlur={e => updateAlt(img.id, e.target.value)}
                />
              </div>
            </div>
          ))}

          {/* Add more tile */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="aspect-square rounded-lg border-2 border-dashed border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-indigo-400 disabled:opacity-50"
          >
            <ImagePlus className="h-6 w-6" />
            <span className="text-[10px] font-medium">Add more</span>
          </button>
        </div>
      )}

      <p className="text-xs text-gray-400">
        {images.length} image{images.length !== 1 ? 's' : ''} · Hover an image to set as default or delete · Drop new images anywhere in the grid
      </p>
    </div>
  )
}
