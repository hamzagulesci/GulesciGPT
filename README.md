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
- ✅ Tamamen ücretsiz (sınırsız bandwidth)
- ✅ Global CDN (180+ lokasyon)
- ✅ DDoS koruması dahil
- ✅ Otomatik HTTPS
- ✅ Turnstile CAPTCHA ile aynı ekosistem
- ✅ Git entegrasyonu (otomatik deploy)

**Detaylı Adımlar:**

#### 1. Cloudflare Hesabı Oluşturun
1. [Cloudflare Pages](https://pages.cloudflare.com) adresine gidin
2. "Sign Up" ile ücretsiz hesap oluşturun
3. Email doğrulaması yapın

#### 2. Yeni Proje Oluşturun
1. Dashboard'da **"Create a project"** butonuna tıklayın
2. **"Connect to Git"** seçeneğini seçin
3. GitHub hesabınızı bağlayın ve yetki verin
4. Repository listesinden **GulesciGPT** repo'nuzu seçin

#### 3. Build Ayarlarını Yapılandırın

Şimdi "Set up builds and deployments" sayfası açılacak. Bu formda şu alanları dolduracaksınız:

**📌 Production branch**
- Dropdown menüden **branch'inizi seçin** (örn: `main`, `master`, veya `claude/gulescigpt-school-ai-chat-...`)
- Bu branch'e her push'ta otomatik deploy olacak

**📌 Framework preset**
- Dropdown menüden **"Next.js"** seçin
- ⚠️ **ÖNEMLİ:** "Next.js (Static Exports)" SEÇMEYİN! Projemiz API routes kullanıyor, static export çalışmaz.
- Sadece "Next.js" seçin (logo ile gösterilir)

**📌 Build command**
- Input field'a şunu yazın: `npx @cloudflare/next-on-pages@1`
- Bu komut Next.js'i Cloudflare Pages için optimize eder

**📌 Build output directory**
- Input field'a şunu yazın: `.vercel/output/static`
- "/" prefix otomatik olarak var, sadece klasör adını yazın

**📌 Root directory (advanced)** - AÇMAYIN
- Bu bölümü açmanıza gerek yok
- Varsayılan "/" değerini kullanın

**📌 Environment variables (advanced)** - BU BÖLÜMÜ AÇIN
1. **"Environment variables (advanced)"** bölümüne tıklayıp açın
2. Her değişken için:
   - **Variable name** kutusuna değişken adını yazın
   - **Value** kutusuna değeri yazın
   - ➕ **"Add variable"** butonuna basın (yeni satır için)

**Eklenecek environment variables:**
```env
NODE_VERSION=20.18.0
```
```env
ADMIN_PASSWORD=güvenli_şifreniz_123
```
```env
JWT_SECRET=en_az_32_karakter_uzunlugunda_gizli_anahtar
```
```env
ENCRYPTION_KEY=64_karakterlik_hexadecimal_string
```
```env
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAAA...
```
```env
TURNSTILE_SECRET_KEY=0x4AAAAAAA...
```
```env
NEXT_PUBLIC_SITE_URL=https://your-site.pages.dev
```
```env
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-xxxxxxxxxxxxxxxx
```
*(Opsiyonel - AdSense kullanmıyorsanız eklemeyin)*

**Encryption Key Oluşturma:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Çıktı: 64 karakterlik hex string (örn: a1b2c3d4...)
```

**Form özeti:**
```
Production branch: main (veya branch'iniz)
Framework preset: Next.js (dropdown'dan seçin)
Build command: npx @cloudflare/next-on-pages@1
Build output directory: .vercel/output/static
Root directory: / (değiştirmeyin)
Environment variables: Yukarıdaki 8 değişkeni ekleyin
```

#### 4. Deploy Edin!

1. Tüm alanları doldurduktan sonra sayfanın en altındaki **"Save and Deploy"** butonuna tıklayın
2. Build işlemi başlayacak (3-5 dakika sürer)
3. Build loglarını canlı olarak takip edebilirsiniz
4. ✅ Build başarılı olursa şöyle bir mesaj göreceksiniz:
   ```
   Success: Assets published!
   ✨ Success! Uploaded X files (Y seconds)
   ```
5. Siteniz otomatik olarak `https://[project-name].pages.dev` adresinde yayında olacak!

**Build başarısız olursa:**
- Logları kontrol edin
- Environment variables'ı doğru girdiğinizden emin olun
- [Troubleshooting](#9-troubleshooting-sorun-giderme) bölümüne bakın

#### 5. İlk Kurulumu Yapın

Build başarılı olduktan sonra sitenizi test edin:

1. **Admin girişi yapın:**
   - `https://your-site.pages.dev/login` adresine gidin
   - Environment variables'a eklediğiniz `ADMIN_PASSWORD` ile giriş yapın

2. **API Key ekleyin:**
   - Admin panelinde **"Keys"** sekmesine gidin
   - [OpenRouter](https://openrouter.ai/keys) hesabınızdan API key alın
   - **"Add API Key"** butonuna tıklayın
   - Key'i yapıştırıp **"Add"** butonuna basın

3. **Chat'i test edin:**
   - Ana sayfaya gidin: `https://your-site.pages.dev`
   - Model seçin (örn: "DeepSeek R1")
   - Bir mesaj yazın: "Merhaba, nasılsın?"
   - ✨ AI yanıt veriyorsa kurulum başarılı!

4. **Sorun varsa kontrol edin:**
   - [ ] Admin login çalışıyor mu?
   - [ ] API key eklenebildi mi?
   - [ ] Chat mesaj gönderiyor mu?
   - [ ] 401 hatası alıyor musunuz? → Environment variables kontrol edin
   - [ ] API key çalışmıyor mu? → OpenRouter dashboard'da kontrol edin

#### 6. Custom Domain Bağlama (Opsiyonel)

**Domain'inizi bağlamak için:**

1. Cloudflare Pages dashboard'unda projenize gidin
2. **Custom domains** sekmesine tıklayın
3. **Set up a custom domain** butonuna basın
4. Domain adınızı girin (örn: `gulescigpt.com`)

**İki seçenek:**

**A) Domain zaten Cloudflare'de:** (Önerilen)
- Cloudflare otomatik DNS kaydı oluşturur
- 1 tıkla aktif olur
- SSL sertifikası otomatik

**B) Domain başka yerde (GoDaddy, Namecheap, vb.):**
1. DNS sağlayıcınıza gidin
2. CNAME kaydı ekleyin:
   ```
   Tip: CNAME
   Name: @ (veya www)
   Value: your-project.pages.dev
   TTL: Auto
   ```
3. 5-10 dakika bekleyin (DNS propagation)
4. Cloudflare Pages'de "Activate domain"
5. SSL sertifikası otomatik oluşturulacak

#### 7. Otomatik Deployment (CI/CD)

✅ **Artık her GitHub push'ta otomatik deploy olacak!**

```bash
# Kod değişikliği yapın
git add .
git commit -m "feat: yeni özellik"
git push origin main

# Cloudflare Pages otomatik olarak:
# 1. Değişikliği algılar
# 2. Build işlemini başlatır
# 3. Deploy eder
# 4. Size email gönderir
```

**Preview Deployments:**
- Her branch için preview URL oluşturulur
- Pull request'lerde otomatik preview
- Örnek: `feature-xyz.your-project.pages.dev`

#### 8. Troubleshooting (Sorun Giderme)

**Build başarısız olursa:**

**❌ Hata: "Error: Could not find Next.js production build"**
```
Çözüm 1: Build command'i kontrol edin
Doğru: npx @cloudflare/next-on-pages@1
Yanlış: npm run build

Çözüm 2: Build output directory'yi kontrol edin
Doğru: .vercel/output/static
Yanlış: .next veya out
```

**❌ Hata: "Command not found: npm"**
```
Çözüm: Environment Variables'a ekleyin:
NODE_VERSION=20.18.0
```

**❌ Hata: "Module not found"**
```bash
Çözüm: package-lock.json dosyası commit edilmiş olmalı
git add package-lock.json
git commit -m "fix: add package-lock"
git push
```

**❌ Hata: "Next.js Static Exports does not support API Routes"**
```
Çözüm: Framework preset'i değiştirin
Yanlış: "Next.js (Static Exports)"
Doğru: "Next.js"
```

**401 Auth Hataları:**
```
Çözüm: Environment variables kontrol edin:
- JWT_SECRET 32+ karakter
- ADMIN_PASSWORD doğru
- ENCRYPTION_KEY 64 hex karakter
```

**API Routes çalışmıyor:**
```
⚠️ Cloudflare Pages, Next.js API routes için
Cloudflare Workers kullanır. Bu ücretsiz planda:
- 100,000 request/day limit
- Worker'lar otomatik oluşturulur
- Ekstra ayar gerekmez
```

**Deployment çok yavaş:**
```
Çözüm: node_modules'u .gitignore'da tutun
Build cache için Settings → Environment →
"Preserve build cache" aktif edin
```

#### 9. Performans Optimizasyonu

**Cloudflare Pages'te hız için:**

1. **Build Cache Aktif Edin**
   - Settings → Builds & deployments
   - "Preserve build cache" ON

2. **Analytics Ekleyin**
   - Dashboard → Web Analytics
   - Ücretsiz, privacy-first analytics

3. **Cache Rules (Advanced)**
   - Cloudflare Dashboard → Caching
   - Next.js static assets için cache rules

4. **Workers KV (Opsiyonel)**
   - API keys için KV storage kullanılabilir
   - data/ klasörü yerine production-ready çözüm

#### 10. Production Checklist (Cloudflare Pages)

Deploy etmeden önce kontrol edin:

- [ ] ✅ Tüm environment variables eklendi
- [ ] ✅ ENCRYPTION_KEY 64 karakter hex
- [ ] ✅ JWT_SECRET 32+ karakter
- [ ] ✅ ADMIN_PASSWORD güçlü şifre
- [ ] ✅ Turnstile keys alındı (Cloudflare dashboard)
- [ ] ✅ OpenRouter API key hazır
- [ ] ✅ Build başarılı
- [ ] ✅ Site açılıyor ve chat çalışıyor
- [ ] ✅ Admin paneline giriş yapılabiliyor
- [ ] ✅ Custom domain bağlandı (opsiyonel)
- [ ] ✅ SSL aktif (yeşil kilit)

#### 11. Cloudflare Pages vs Vercel Karşılaştırma

| Özellik | Cloudflare Pages | Vercel |
|---------|------------------|--------|
| **Fiyat** | Tamamen ücretsiz | Free tier: 100GB/ay |
| **Bandwidth** | Sınırsız | 100GB limit |
| **Build Minutes** | 500/ay | 6000/ay |
| **Requests** | 100K/gün Workers | Sınırsız |
| **CDN** | 180+ lokasyon | Global Edge Network |
| **DDoS Koruması** | ✅ Dahil | ✅ Dahil |
| **Next.js Desteği** | ⚠️ API routes limited | ✅ Full support |
| **Önerilen** | Basit projeler | Next.js production |

**Sonuç:**
- 💰 **Maliyet odaklıysanız:** Cloudflare Pages
- 🚀 **Next.js full features:** Vercel
- 🔒 **Güvenlik + ücretsiz:** Cloudflare Pages

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