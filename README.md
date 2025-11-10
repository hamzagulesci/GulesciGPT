# GüleşciGPT - Okul AI Chat Platformu

Okul çapında kullanılacak ücretsiz AI chat uygulaması. OpenRouter üzerinden 53 farklı ücretsiz AI modeline erişim sağlar.

## 🚀 Özellikler

### 🤖 AI Chat
- **53 Farklı Free Model**: DeepSeek R1, Llama, Mistral, Gemini ve daha fazlası
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

## 🚢 Deployment

### Vercel

1. GitHub'a push edin
2. Vercel dashboard'a gidin
3. "New Project" → GitHub repo seçin
4. Environment variables ekleyin
5. Deploy edin

### Cloudflare Pages

1. Cloudflare dashboard → Pages
2. GitHub repo bağlayın
3. Build settings:
   - Framework: Next.js
   - Build command: `npm run build`
   - Output: `.next`
4. Environment variables ekleyin
5. Deploy edin

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