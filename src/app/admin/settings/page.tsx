'use client'
import { useState, useEffect, useRef } from 'react'
import { Upload, Loader2, Check, AlertCircle, Image as ImageIcon, X, Plus, Trash2, GripVertical, ChevronUp, ChevronDown } from 'lucide-react'

interface Slide {
  image: string
  badge: string
  tags: string
  title: string
  subtitle: string
  cta: string
  href: string
}

interface Category {
  id: string; name: string; slug: string; imageUrl: string | null
  parentId?: string | null; sortOrder?: number
}

const BLANK_SLIDE: Slide = { image: '', badge: '', tags: '', title: '', subtitle: '', cta: '', href: '/collections' }

// ─── Cloudinary Upload ────────────────────────────────────────────────────────
async function uploadToCloudinary(file: File, onProgress?: (p: number) => void): Promise<{ url: string } | { error: string }> {
  const sr = await fetch('/api/admin/cloudinary-sign')
  const s  = await sr.json()
  if (!sr.ok) return { error: s.error ?? 'Cloudinary not configured' }
  return new Promise((resolve) => {
    const fd = new FormData()
    fd.append('file', file); fd.append('api_key', s.apiKey)
    fd.append('timestamp', String(s.timestamp)); fd.append('signature', s.signature)
    fd.append('folder', s.folder)
    const xhr = new XMLHttpRequest()
    xhr.open('POST', 'https://api.cloudinary.com/v1_1/' + s.cloudName + '/image/upload')
    xhr.upload.onprogress = e => { if (e.lengthComputable && onProgress) onProgress(Math.round(e.loaded / e.total * 100)) }
    xhr.onload = () => {
      if (xhr.status !== 200) { resolve({ error: 'Upload failed' }); return }
      resolve({ url: JSON.parse(xhr.responseText).secure_url })
    }
    xhr.onerror = () => resolve({ error: 'Network error' })
    xhr.send(fd)
  })
}

// ─── Image Upload Box ─────────────────────────────────────────────────────────
function ImgBox({ value, label, onChange }: { value: string; label: string; onChange: (u: string) => void }) {
  const [uploading, setUploading] = useState(false)
  const [pct, setPct] = useState(0)
  const [err, setErr] = useState('')
  const ref = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setErr(''); setUploading(true); setPct(0)
    const r = await uploadToCloudinary(file, setPct)
    setUploading(false)
    if ('error' in r) { setErr(r.error); return }
    onChange(r.url)
  }

  return (
    <div className="space-y-1">
      {label && <p className="text-xs font-medium text-gray-500">{label}</p>}
      <div
        className="relative rounded-lg overflow-hidden border-2 border-dashed border-gray-200 hover:border-indigo-300 cursor-pointer transition-colors group bg-gray-50"
        style={{ aspectRatio: '16/7' }}
        onClick={() => ref.current?.click()}
      >
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-xs font-semibold flex items-center gap-1"><Upload className="h-3.5 w-3.5" /> Change</span>
            </div>
            <button type="button" onClick={e => { e.stopPropagation(); onChange('') }}
              className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <X className="h-3 w-3" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-1 text-gray-400">
            {uploading ? <Loader2 className="h-5 w-5 animate-spin text-indigo-400" /> : <ImageIcon className="h-5 w-5" />}
            <span className="text-[11px]">{uploading ? pct + '%' : 'Click to upload'}</span>
          </div>
        )}
        {uploading && value && (
          <div className="absolute bottom-0 inset-x-0 h-1 bg-black/20">
            <div className="h-full bg-indigo-400 transition-all" style={{ width: pct + '%' }} />
          </div>
        )}
      </div>
      {err && <p className="text-[11px] text-red-500">{err}</p>}
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [logoUrl,    setLogoUrl]    = useState('')
  const [whatsapp,   setWhatsapp]   = useState('')
  const [slides,     setSlides]     = useState<Slide[]>([{ ...BLANK_SLIDE }])
  const [categories, setCategories] = useState<Category[]>([])
  const [saving,     setSaving]     = useState<string | null>(null)
  const [saved,      setSaved]      = useState<string | null>(null)
  const [error,      setError]      = useState('')

  // Social media links
  const [socialFacebook,  setSocialFacebook]  = useState('')
  const [socialInstagram, setSocialInstagram] = useState('')
  const [socialLinkedin,  setSocialLinkedin]  = useState('')
  const [socialGoogle,    setSocialGoogle]    = useState('')
  const [socialTiktok,    setSocialTiktok]    = useState('')
  const [socialWhatsapp,  setSocialWhatsapp]  = useState('')

  // Google integrations
  const [gaMeasurementId,  setGaMeasurementId]  = useState('')
  const [gtmContainerId,   setGtmContainerId]   = useState('')
  const [gscVerification,  setGscVerification]  = useState('')
  const [gbpUrl,           setGbpUrl]           = useState('')

  const inputCls = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/settings?keys=logo_url,hero_slides,whatsapp_number,social_facebook,social_instagram,social_linkedin,social_google,social_tiktok,social_whatsapp,ga_measurement_id,gtm_container_id,gsc_verification,gbp_url').then(r => r.json()),
      fetch('/api/admin/categories').then(r => r.json()),
    ]).then(([settings, cats]) => {
      const s = settings.data ?? {}
      if (s.logo_url) setLogoUrl(s.logo_url)
      if (s.whatsapp_number) setWhatsapp(s.whatsapp_number)
      setSocialFacebook(s.social_facebook  ?? '')
      setSocialInstagram(s.social_instagram ?? '')
      setSocialLinkedin(s.social_linkedin  ?? '')
      setSocialGoogle(s.social_google    ?? '')
      setSocialTiktok(s.social_tiktok    ?? '')
      setSocialWhatsapp(s.social_whatsapp  ?? '')
      setGaMeasurementId(s.ga_measurement_id ?? '')
      setGtmContainerId(s.gtm_container_id  ?? '')
      setGscVerification(s.gsc_verification  ?? '')
      setGbpUrl(s.gbp_url                   ?? '')
      if (s.hero_slides) {
        try {
          const parsed = JSON.parse(s.hero_slides)
          if (Array.isArray(parsed) && parsed.length) {
            setSlides(parsed.map((p: Partial<Slide>) => ({
              image: p.image ?? '', badge: p.badge ?? '', tags: Array.isArray(p.tags) ? (p.tags as string[]).join(', ') : (p.tags ?? ''),
              title: p.title ?? '', subtitle: p.subtitle ?? '', cta: p.cta ?? '', href: p.href ?? '/collections',
            })))
          }
        } catch { /* keep default */ }
      }
      const list: Category[] = (cats.data ?? [])
        .filter((c: Category) => !c.parentId)
        .sort((a: Category, b: Category) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      setCategories(list)
    }).catch(() => setError('Failed to load settings'))
  }, [])

  async function saveSetting(key: string, value: string, sectionKey: string) {
    setSaving(sectionKey); setError('')
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      })
      if (!res.ok) throw new Error('Save failed')
      setSaved(sectionKey); setTimeout(() => setSaved(null), 2500)
    } catch { setError('Failed to save') }
    finally { setSaving(null) }
  }

  async function saveSlides() {
    const payload = slides.map(s => ({
      ...s,
      tags: s.tags.split(',').map(t => t.trim()).filter(Boolean),
    }))
    await saveSetting('hero_slides', JSON.stringify(payload), 'slides')
  }

  function addSlide() { setSlides(p => [...p, { ...BLANK_SLIDE }]) }
  function removeSlide(i: number) { setSlides(p => p.filter((_, idx) => idx !== i)) }
  function moveSlide(i: number, dir: -1 | 1) {
    setSlides(p => {
      const arr = [...p]; const j = i + dir
      if (j < 0 || j >= arr.length) return arr
      ;[arr[i], arr[j]] = [arr[j], arr[i]]; return arr
    })
  }
  function updateSlide(i: number, field: keyof Slide, val: string) {
    setSlides(p => p.map((s, idx) => idx === i ? { ...s, [field]: val } : s))
  }

  async function saveCategoryImage(catId: string, imageUrl: string) {
    setSaving('cat-' + catId)
    try {
      await fetch('/api/admin/categories/' + catId, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: imageUrl || null }),
      })
      setCategories(p => p.map(c => c.id === catId ? { ...c, imageUrl: imageUrl || null } : c))
      setSaved('cat-' + catId); setTimeout(() => setSaved(null), 2500)
    } catch { setError('Failed to save category image') }
    finally { setSaving(null) }
  }

  const SaveBtn = ({ sectionKey, onClick, label, color }: { sectionKey: string; onClick: () => void; label: string; color?: string }) => (
    <div className="flex items-center gap-3">
      <button type="button" onClick={onClick} disabled={saving === sectionKey}
        className={'px-4 py-2 text-white text-sm font-medium rounded-lg disabled:opacity-60 transition-colors flex items-center gap-2 ' + (color ?? 'bg-indigo-600 hover:bg-indigo-700')}>
        {saving === sectionKey && <Loader2 className="h-4 w-4 animate-spin" />}
        {label}
      </button>
      {saved === sectionKey && <span className="text-xs text-green-600 flex items-center gap-1"><Check className="h-3.5 w-3.5" /> Saved</span>}
    </div>
  )

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Logo, hero slider, category images, WhatsApp</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {/* ── Logo ── */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Logo</h2>
        <p className="text-xs text-gray-400">Recommended: transparent PNG, <strong>400 × 80 px</strong> — wide rectangle, content filling edge-to-edge.</p>
        <div className="max-w-xs">
          <ImgBox value={logoUrl} label="" onChange={setLogoUrl} />
        </div>
        <SaveBtn sectionKey="logo" onClick={() => saveSetting('logo_url', logoUrl, 'logo')} label="Save Logo" />
      </section>

      {/* ── WhatsApp ── */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">WhatsApp Button</h2>
        <p className="text-xs text-gray-400">Floating button on all shop pages. On product pages it pre-fills the product name, price and link in the message.</p>
        <div className="max-w-sm space-y-1">
          <label className="block text-xs font-medium text-gray-600">Number <span className="font-normal text-gray-400">(country code + digits only)</span></label>
          <input type="text" value={whatsapp} onChange={e => setWhatsapp(e.target.value.replace(/\D/g, ''))} placeholder="e.g. 8801712345678" className={inputCls} />
          <p className="text-[11px] text-gray-400">Bangladesh: 88 + 01XXXXXXXXX</p>
        </div>
        <SaveBtn sectionKey="whatsapp" onClick={() => saveSetting('whatsapp_number', whatsapp, 'whatsapp')} label="Save Number" color="bg-[#25D366] hover:bg-[#1fb855]" />
      </section>

      {/* ── Hero Slider ── */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Hero Slider</h2>
            <p className="text-xs text-gray-400 mt-0.5">Auto-playing full-height slider on the homepage. Recommended image: <strong>1440 × 900 px</strong>.</p>
          </div>
          <button type="button" onClick={addSlide}
            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors">
            <Plus className="h-3.5 w-3.5" /> Add Slide
          </button>
        </div>

        <div className="space-y-4">
          {slides.map((slide, i) => (
            <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
              {/* Slide header */}
              <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                <GripVertical className="h-4 w-4 text-gray-300 shrink-0" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex-1">Slide {i + 1}</span>
                <button type="button" onClick={() => moveSlide(i, -1)} disabled={i === 0} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"><ChevronUp className="h-3.5 w-3.5" /></button>
                <button type="button" onClick={() => moveSlide(i, 1)} disabled={i === slides.length - 1} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"><ChevronDown className="h-3.5 w-3.5" /></button>
                {slides.length > 1 && (
                  <button type="button" onClick={() => removeSlide(i)} className="p-1 text-red-400 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
                )}
              </div>

              <div className="p-4 space-y-3">
                {/* Image */}
                <ImgBox value={slide.image} label="Slide image (1440 × 900 px recommended)" onChange={v => updateSlide(i, 'image', v)} />

                <div className="grid grid-cols-2 gap-3">
                  {/* Badge */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Badge pill <span className="text-gray-400 font-normal">(optional, e.g. "NEWLY LAUNCHED")</span></label>
                    <input className={inputCls} value={slide.badge} onChange={e => updateSlide(i, 'badge', e.target.value)} placeholder="NEWLY LAUNCHED" />
                  </div>
                  {/* Link */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Link URL</label>
                    <div className="flex gap-1">
                      <input className={inputCls} value={slide.href} onChange={e => updateSlide(i, 'href', e.target.value)} placeholder="/collections" />
                      {categories.length > 0 && (
                        <select className="px-2 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shrink-0"
                          onChange={e => { if (e.target.value) updateSlide(i, 'href', '/collections/' + e.target.value) }}
                          value="">
                          <option value="">Cat →</option>
                          {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                        </select>
                      )}
                    </div>
                  </div>
                  {/* Sub-tags */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Sub-tags <span className="text-gray-400 font-normal">(comma-separated, e.g. "BAGGY, RELAXED")</span></label>
                    <input className={inputCls} value={slide.tags} onChange={e => updateSlide(i, 'tags', e.target.value)} placeholder="BAGGY, RELAXED, STRAIGHT" />
                  </div>
                  {/* Title */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Title (large text)</label>
                    <input className={inputCls} value={slide.title} onChange={e => updateSlide(i, 'title', e.target.value)} placeholder="MUST-HAVE DENIMS" />
                  </div>
                  {/* Subtitle */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Subtitle (small label above title)</label>
                    <input className={inputCls} value={slide.subtitle} onChange={e => updateSlide(i, 'subtitle', e.target.value)} placeholder="Shop the collection" />
                  </div>
                  {/* CTA */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">CTA button text <span className="text-gray-400 font-normal">(optional)</span></label>
                    <input className={inputCls} value={slide.cta} onChange={e => updateSlide(i, 'cta', e.target.value)} placeholder="FLAT 50% OFF*" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <SaveBtn sectionKey="slides" onClick={saveSlides} label="Save Slider" />
      </section>

      {/* ── Category Images ── */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Category Images</h2>
          <p className="text-xs text-gray-400 mt-1">Shown in the Featured Categories grid. Recommended: portrait <strong>600 × 800 px</strong>.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {categories.map(cat => (
            <div key={cat.id} className="space-y-1">
              <ImgBox value={cat.imageUrl ?? ''} label={cat.name} onChange={url => saveCategoryImage(cat.id, url)} />
              {saved === 'cat-' + cat.id && (
                <span className="text-[11px] text-green-600 flex items-center gap-1"><Check className="h-3 w-3" /> Saved</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Google & Analytics ── */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
        <div>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Google &amp; Analytics</h2>
          <p className="text-xs text-gray-400 mt-1">
            Paste your IDs below — no code changes needed. Settings take effect on the next page load.
          </p>
        </div>

        <div className="space-y-5">
          {/* GA4 */}
          <div className="p-4 rounded-lg border border-gray-100 bg-gray-50 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-base">📊</span>
              <p className="text-sm font-semibold text-gray-700">Google Analytics 4 (GA4)</p>
            </div>
            <p className="text-xs text-gray-400">
              Tracks visits, purchases, and user behaviour. Find your ID in{' '}
              <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                Google Analytics
              </a>{' '}
              → Admin → Data Streams → your stream → Measurement ID.
            </p>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-600">Measurement ID</label>
              <input
                type="text"
                value={gaMeasurementId}
                onChange={e => setGaMeasurementId(e.target.value.trim())}
                placeholder="G-XXXXXXXXXX"
                className={inputCls + ' font-mono max-w-xs'}
              />
              <p className="text-[11px] text-gray-400">Format: G- followed by 10 characters</p>
            </div>
            <SaveBtn
              sectionKey="ga"
              label="Save GA4 ID"
              onClick={() => saveSetting('ga_measurement_id', gaMeasurementId, 'ga')}
            />
          </div>

          {/* GTM */}
          <div className="p-4 rounded-lg border border-gray-100 bg-gray-50 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-base">🏷️</span>
              <p className="text-sm font-semibold text-gray-700">Google Tag Manager (GTM)</p>
            </div>
            <p className="text-xs text-gray-400">
              Optional — use GTM if you want to manage multiple tags (Facebook Pixel, TikTok, etc.) without code deploys.
              Find your ID in{' '}
              <a href="https://tagmanager.google.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                Tag Manager
              </a>{' '}
              → your workspace → Container ID (top-right).
            </p>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-600">Container ID</label>
              <input
                type="text"
                value={gtmContainerId}
                onChange={e => setGtmContainerId(e.target.value.trim())}
                placeholder="GTM-XXXXXXX"
                className={inputCls + ' font-mono max-w-xs'}
              />
              <p className="text-[11px] text-gray-400">Format: GTM- followed by 7 characters</p>
            </div>
            <SaveBtn
              sectionKey="gtm"
              label="Save GTM ID"
              onClick={() => saveSetting('gtm_container_id', gtmContainerId, 'gtm')}
            />
          </div>

          {/* Google Search Console */}
          <div className="p-4 rounded-lg border border-gray-100 bg-gray-50 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-base">🔍</span>
              <p className="text-sm font-semibold text-gray-700">Google Search Console</p>
            </div>
            <p className="text-xs text-gray-400">
              Verifies site ownership so Google can show you search queries, indexing issues, and Core Web Vitals.
              In{' '}
              <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                Search Console
              </a>
              {' '}→ Add property → choose &ldquo;URL prefix&rdquo; → select &ldquo;HTML tag&rdquo; method →
              copy only the <strong>content=&quot;…&quot;</strong> value (not the full tag).
            </p>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-600">Verification code</label>
              <input
                type="text"
                value={gscVerification}
                onChange={e => setGscVerification(e.target.value.trim())}
                placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className={inputCls + ' font-mono'}
              />
              <p className="text-[11px] text-gray-400">
                Paste only the code value — e.g. <code className="bg-gray-100 px-1 rounded">abc123XYZ…</code>, not the full{' '}
                <code className="bg-gray-100 px-1 rounded">&lt;meta&gt;</code> tag.
              </p>
            </div>
            <SaveBtn
              sectionKey="gsc"
              label="Save & Verify"
              onClick={() => saveSetting('gsc_verification', gscVerification, 'gsc')}
            />
          </div>

          {/* Google Business Profile */}
          <div className="p-4 rounded-lg border border-gray-100 bg-gray-50 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-base">📍</span>
              <p className="text-sm font-semibold text-gray-700">Google Business Profile</p>
            </div>
            <p className="text-xs text-gray-400">
              Your GBP listing URL — used in footer links and structured data (sameAs). Find it by searching your
              business name on Google Maps → Share → Copy link.
            </p>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-600">GBP URL</label>
              <input
                type="url"
                value={gbpUrl}
                onChange={e => setGbpUrl(e.target.value.trim())}
                placeholder="https://maps.app.goo.gl/xxxxxxxxxx"
                className={inputCls}
              />
            </div>
            <SaveBtn
              sectionKey="gbp"
              label="Save GBP URL"
              onClick={() => saveSetting('gbp_url', gbpUrl, 'gbp')}
            />
          </div>
        </div>
      </section>

      {/* ── Social Media Links ── */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Social Media Links</h2>
          <p className="text-xs text-gray-400 mt-1">These links appear as icons in the site footer. Leave a field blank to hide that icon.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-600">Facebook URL</label>
            <input type="url" value={socialFacebook} onChange={e => setSocialFacebook(e.target.value)} placeholder="https://facebook.com/yourpage" className={inputCls} />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-600">Instagram URL</label>
            <input type="url" value={socialInstagram} onChange={e => setSocialInstagram(e.target.value)} placeholder="https://instagram.com/yourhandle" className={inputCls} />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-600">TikTok URL</label>
            <input type="url" value={socialTiktok} onChange={e => setSocialTiktok(e.target.value)} placeholder="https://tiktok.com/@yourhandle" className={inputCls} />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-600">WhatsApp Link</label>
            <input type="url" value={socialWhatsapp} onChange={e => setSocialWhatsapp(e.target.value)} placeholder="https://wa.me/8801712345678" className={inputCls} />
            <p className="text-[11px] text-gray-400">Format: https://wa.me/[country code + number]</p>
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-600">LinkedIn URL</label>
            <input type="url" value={socialLinkedin} onChange={e => setSocialLinkedin(e.target.value)} placeholder="https://linkedin.com/company/yourname" className={inputCls} />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-600">Google / Maps URL <span className="text-gray-400 font-normal">(optional)</span></label>
            <input type="url" value={socialGoogle} onChange={e => setSocialGoogle(e.target.value)} placeholder="https://g.page/yourplace" className={inputCls} />
          </div>
        </div>
        <SaveBtn
          sectionKey="social"
          label="Save Social Links"
          onClick={async () => {
            setSaving('social'); setError('')
            try {
              await Promise.all([
                fetch('/api/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'social_facebook',  value: socialFacebook  }) }),
                fetch('/api/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'social_instagram', value: socialInstagram }) }),
                fetch('/api/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'social_linkedin',  value: socialLinkedin  }) }),
                fetch('/api/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'social_google',    value: socialGoogle    }) }),
                fetch('/api/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'social_tiktok',    value: socialTiktok    }) }),
                fetch('/api/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'social_whatsapp',  value: socialWhatsapp  }) }),
              ])
              setSaved('social'); setTimeout(() => setSaved(null), 2500)
            } catch { setError('Failed to save social links') }
            finally { setSaving(null) }
          }}
        />
      </section>
    </div>
  )
}
