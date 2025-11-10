# GüleşciGPT - Okul AI Chat Platformu

Okul çapında kullanılacak ücretsiz AI chat uygulaması. OpenRouter üzerinden 47 farklı ücretsiz AI modeline erişim sağlar.

---

## ⚡ HIZLI BAŞLANGIÇ (5 Dakika)

Test etmek için hemen başla:

```bash
# 1. Klonla
git clone https://github.com/hamzagulesci/GulesciGPT.git
cd GulesciGPT

# 2. Yükle
npm install

# 3. Çalıştır (.env.local zaten hazır!)
npm run dev
```

**Şimdi:**
1. 🌐 http://localhost:3000/login aç → Şifre: `admin123`
2. 🔑 OpenRouter API key ekle: https://openrouter.ai/keys
3. 💬 http://localhost:3000 → Mesaj gönder!

**📖 Detaylı kurulum:** [SETUP.md](./SETUP.md) dosyasına bak

---

## 🚀 Özellikler

### 🤖 AI Chat
- **47 Farklı Free Model**: DeepSeek R1, Llama 4, Mistral, Gemini 2.0 ve daha fazlası
- **DeepSeek R1 Özel Özelliği**: Düşünce süreci (reasoning) gösterimi
- **Real-time Streaming**: Cevaplar anında akışla gelir
- **Chat Geçmişi**: Son 50 sohbet localStorage'da saklanır
- **Model Değiştirme**: İstediğiniz modele kolayca geçiş yapın

### 🔒 Güvenlik
- **Cloudflare Turnstile CAPTCHA**: Her mesajda doğrulama
- **API Key Rotation**: Otomatik key yönetimi ve failover
- **Admin Paneli Koruması**: JWT tabanlı authentication
- **XSS Koruması**: Input sanitization

### 📊 Admin Paneli
- **API Key Yönetimi**: Key ekleme, silme, aktif/pasif yapma
- **İstatistikler**: Mesaj trendi, model kullanımı grafikleri
- **Sistem Durumu**: Performance metrikleri ve uptime

### 💰 Monetizasyon
- Google AdSense entegrasyonu
- Responsive reklam alanları (sidebar, mobil banner)

## 🛠 Teknolojiler

- **Framework**: Next.js 14 (App Router)
- **Dil**: TypeScript
- **UI**: Tailwind CSS, shadcn/ui
- **AI Provider**: OpenRouter (sadece free modeller)
- **Auth**: JWT (jose)
- **CAPTCHA**: Cloudflare Turnstile
- **Grafikler**: Recharts
- **State Management**: React Hooks + LocalStorage

## 📦 Kurulum

### 1. Depoyu Klonlayın

```bash
git clone https://github.com/hamzagulesci/GulesciGPT.git
cd GulesciGPT
```

### 2. Bağımlılıkları Yükleyin

```bash
npm install
```

### 3. Environment Variables

`.env.local` dosyası oluşturun:

```bash
cp .env.example .env.local
```

Aşağıdaki değişkenleri doldurun:

```env
# Cloudflare Turnstile CAPTCHA
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-site-key
TURNSTILE_SECRET_KEY=your-secret-key

# Admin Authentication
ADMIN_PASSWORD=your-secure-password
JWT_SECRET=your-jwt-secret-min-32-chars

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Google AdSense (opsiyonel)
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-xxxxxxxxxxxxxxxx
```

### 4. Data Klasörünü Hazırlayın

Data klasörü zaten var, dosyalar boş olarak oluşturulmuş.

### 5. Development Modunda Çalıştırın

```bash
npm run dev
```

Tarayıcıda `http://localhost:3000` adresini açın.

## 🔑 Admin Paneline Giriş

1. `http://localhost:3000/login` adresine gidin
2. `.env.local`'daki `ADMIN_PASSWORD` ile giriş yapın
3. Admin panelinde:
   - API key ekleyin (OpenRouter'dan alın)
   - İstatistikleri görüntüleyin
   - Sistem durumunu kontrol edin

## 🌐 OpenRouter API Key Alma

1. [OpenRouter](https://openrouter.ai) hesabı oluşturun
2. Dashboard'dan API key oluşturun
3. Admin panelinden key'i ekleyin
4. Key otomatik olarak free modeller için kullanılacak

## 🚢 Deployment & Hosting Önerileri

### 🌟 Önerilen: Vercel (En İyi Next.js Desteği)

**Neden Vercel?**
- Next.js geliştiricileri tarafından yapıldı
- Sıfır konfigürasyon
- Otomatik HTTPS ve CDN
- Ücretsiz plan: 100 GB bandwidth, sınırsız dağıtım
- Mükemmel performans ve hız
- Kolay domain bağlama

**Adımlar:**
1. [Vercel](https://vercel.com) hesabı oluşturun
2. GitHub repo'yu bağlayın
3. "New Project" → GulesciGPT seçin
4. Environment variables ekleyin:
   ```
   TURNSTILE_SECRET_KEY=xxx
   ADMIN_PASSWORD=xxx
   JWT_SECRET=xxx
   NEXT_PUBLIC_TURNSTILE_SITE_KEY=xxx
   NEXT_PUBLIC_SITE_URL=https://gulescigpt.com
   ```
5. Deploy! (Otomatik build edilir)
6. Custom domain ekle: Settings → Domains → gulescigpt.com

### 🔵 Alternatif: Cloudflare Pages (Ücretsiz + Hızlı)

**Neden Cloudflare Pages?**
- Tamamen ücretsiz (bandwidth limiti yok)
- Cloudflare CDN entegrasyonu
- DDoS koruması
- Hızlı global delivery
- Turnstile CAPTCHA ile aynı ekosistem

**Adımlar:**
1. [Cloudflare Pages](https://pages.cloudflare.com) → Create a project
2. GitHub repo bağlayın
3. Build settings:
   - Framework: Next.js
   - Build command: `npm run build`
   - Output directory: `.next`
   - Node version: 18+
4. Environment variables ekleyin (yukarıdaki gibi)
5. Deploy et
6. Custom domain: Custom domains → Add domain

### ⚡ Diğer Alternatifler

**Netlify:**
- Ücretsiz plan: 100 GB bandwidth
- Otomatik HTTPS
- Form handling ve serverless functions

**Railway:**
- Hobby plan: $5/ay
- Database hosting dahil
- Kolay scale

**DigitalOcean App Platform:**
- $5/ay'dan başlayan planlar
- Tam kontrol
- Database ve managed services

### 📝 Production Checklist

Deployment öncesi kontrol edin:

- [ ] `.env.local` dosyasındaki tüm değişkenleri production'a ekledim
- [ ] Cloudflare Turnstile key'lerini aldım
- [ ] En az 1 OpenRouter API key ekledim (admin panelinden)
- [ ] Admin şifresini güçlü bir şifreyle değiştirdim
- [ ] JWT_SECRET en az 32 karakter
- [ ] Domain'i custom domain olarak ekledim
- [ ] SSL/HTTPS aktif
- [ ] Google AdSense hesabı oluşturdum (opsiyonel)

### 🌐 Domain Bağlama

**gulescigpt.com domain'inizi bağlamak için:**

1. Domain sağlayıcınızdan (GoDaddy, Namecheap, vb.) DNS ayarlarına gidin
2. A record veya CNAME ekleyin:
   - Vercel için: CNAME → cname.vercel-dns.com
   - Cloudflare Pages için: CNAME → [your-project].pages.dev
3. Hosting platformundan custom domain ekleyin
4. SSL sertifikası otomatik oluşturulacak (5-10 dakika)

### 🔒 Production Güvenlik

Production'da mutlaka yapın:

1. **Rate Limiting ekleyin** (Opsiyonel ama önerilir):
   - Vercel Edge Config veya Upstash Redis
   - IP başına 20 mesaj/saat limiti

2. **Environment variables'ları güvenli tutun**:
   - Asla GitHub'a commitlemeyin
   - Production ve development için farklı key'ler kullanın

3. **Monitoring ekleyin**:
   - Vercel Analytics
   - Sentry (error tracking)
   - Log yönetimi

## 📁 Proje Yapısı

```
gulescigpt/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── chat/         # Chat endpoint
│   │   ├── admin/        # Admin endpoints
│   │   └── verify-captcha/
│   ├── admin/            # Admin panel
│   ├── login/            # Login page
│   └── page.tsx          # Ana sayfa
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── admin/            # Admin components
│   ├── Chat.tsx          # Ana chat component
│   ├── Sidebar.tsx       # Sol sidebar
│   ├── MessageList.tsx   # Mesaj listesi
│   └── MessageInput.tsx  # Input alanı
├── lib/                   # Utility functions
│   ├── openrouter.ts     # OpenRouter API client
│   ├── keyManager.ts     # API key rotation
│   ├── statsManager.ts   # İstatistik yönetimi
│   ├── localStorage.ts   # LocalStorage helpers
│   ├── auth.ts           # JWT authentication
│   ├── models.ts         # Model tanımları
│   └── utils.ts          # Genel utilities
├── data/                  # Data files (gitignore)
│   ├── api-keys.json     # API keys
│   └── stats.json        # İstatistikler
└── middleware.ts          # Admin auth middleware
```

## ⚠️ Önemli Notlar

### Güvenlik
- API key'ler asla client'a gönderilmez
- Tüm OpenRouter istekleri server-side'dan yapılır
- CAPTCHA her mesajda zorunludur
- Admin paneli JWT ile korunur

### Performans
- Chat geçmişi localStorage'da (max 50 sohbet)
- Stats dosyası atomic write ile güncellenir (race condition önleme)
- API key rotation otomatik (rate limit durumunda)

### Limitler
- Max 50 sohbet localStorage'da
- CAPTCHA her mesaj için yenilenir
- Free modeller için OpenRouter limitleri geçerlidir

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

MIT License

## 📧 İletişim

Proje Sahibi: Hamza Güleşci
- GitHub: [@hamzagulesci](https://github.com/hamzagulesci)
- Website: [gulescigpt.com](https://gulescigpt.com)

## 🙏 Teşekkürler

- [OpenRouter](https://openrouter.ai) - Free AI model access
- [Cloudflare](https://cloudflare.com) - Turnstile CAPTCHA
- [Vercel](https://vercel.com) - Deployment platform
- [shadcn/ui](https://ui.shadcn.com) - UI components

---

**Not**: Bu proje öğrenci projesi olarak geliştirilmiştir. Production kullanımı için ek güvenlik önlemleri ve rate limiting eklemeyi düşünün.