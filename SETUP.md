# 🚀 HamzaGPT - HIZLI BAŞLANGIÇ REHBERİ

## ⚡ 5 Dakikada Test Et

### Adım 1: Dosyaları Hazırla

```bash
# Projeyi klonla (zaten yaptıysan geç)
git clone https://github.com/hamzagulesci/GulesciGPT.git
cd GulesciGPT

# Bağımlılıkları yükle
npm install
```

### Adım 2: Environment Variables

`.env.local` dosyası zaten hazır! İçeriği:

```env
ADMIN_PASSWORD=admin123
JWT_SECRET=super-secret-jwt-key-must-be-at-least-32-characters-long-here
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# CAPTCHA boş (development bypass aktif)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
```

**ÖNEMLİ:** CAPTCHA key'leri boş olduğu için mesaj gönderme çalışacak!

### Adım 3: Uygulamayı Başlat

```bash
npm run dev
```

Tarayıcıda aç: **http://localhost:3000**

### Adım 4: OpenRouter API Key Ekle

1. **API Key Al:**
   - https://openrouter.ai/keys adresine git
   - Hesap oluştur (ücretsiz)
   - "Create Key" → İsim ver → Kopyala

2. **Admin Paneline Gir:**
   - http://localhost:3000/login
   - Şifre: `admin123`

3. **API Key Ekle:**
   - "API Key Yönetimi" sekmesi
   - "Yeni Key Ekle" butonu
   - Kopyaladığın key'i yapıştır
   - "Ekle"

### Adım 5: İlk Mesajı Gönder!

1. http://localhost:3000 anasayfaya dön
2. Altta "⚠️ CAPTCHA devre dışı (Development modu)" yazısını göreceksin
3. Bir mesaj yaz ve gönder!

---

## 🔧 SORUN GİDERME

### ❌ "API key bulunamadı" hatası

**Çözüm:**
```bash
# Admin paneline git
http://localhost:3000/login

# Şifre: admin123
# API Key Yönetimi → Yeni Key Ekle
# OpenRouter key'ini yapıştır
```

### ❌ "Sistem yoğun" hatası

**Sebep:** Hiç API key eklenmemiş veya tümü pasif

**Çözüm:**
1. Admin panelinden key durumunu kontrol et
2. En az 1 key "Aktif" olmalı (yeşil)
3. Pasifse, key'e tıkla → Aktif yap

### ❌ Mesaj gönderilemiyor

**Kontrol listesi:**
```bash
# 1. npm run dev çalışıyor mu?
# Terminal'de "ready" yazmalı

# 2. .env.local var mı?
ls -la .env.local

# 3. API key eklendi mi?
# http://localhost:3000/admin → API Key sayısı > 0

# 4. Browser console'da hata var mı?
# F12 → Console sekmesi
```

### ❌ Admin paneline giremiyorum

**Şifre:** `admin123`

Değiştirmek için:
```bash
# .env.local dosyasını aç
# ADMIN_PASSWORD satırını değiştir
# npm run dev'i yeniden başlat
```

---

## 🌐 CLOUDFLARE TURNSTILE NASIL EKLENİR?

### Production için (zorunlu):

#### 1. Cloudflare Hesabı Oluştur
- https://dash.cloudflare.com/sign-up
- Email doğrula

#### 2. Turnstile Oluştur
1. Dashboard → "Turnstile" menüsü
2. "Add Site" butonu
3. **Site name:** HamzaGPT
4. **Domain:** hamzagpt.com (veya subdomain)
5. **Widget Mode:** Managed
6. "Create" butonu

#### 3. Key'leri Kopyala
- **Site Key** (başlar: 0x...)
- **Secret Key** (başlar: 0x...)

#### 4. Production'a Ekle

**Vercel:**
```bash
# Vercel Dashboard → Project → Settings → Environment Variables

NEXT_PUBLIC_TURNSTILE_SITE_KEY = 0x4AAA...
TURNSTILE_SECRET_KEY = 0x4AAA...
```

**Cloudflare Pages:**
```bash
# Cloudflare Pages → Project → Settings → Environment Variables

NEXT_PUBLIC_TURNSTILE_SITE_KEY = 0x4AAA...
TURNSTILE_SECRET_KEY = 0x4AAA...
```

#### 5. Redeploy
- Vercel: Otomatik
- Cloudflare: "Retry deployment"

### Development için (opsiyonel):

Test etmek istersen:

```bash
# .env.local dosyasını aç
# Turnstile key'leri ekle:

NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAA...
TURNSTILE_SECRET_KEY=0x4AAA...
```

**NOT:** Development'ta domain `localhost` olarak ekle Turnstile'a!

---

## 🎯 ÖNEMLİ NOTLAR

### ✅ Development Modu (Şu an):
- CAPTCHA: ❌ Devre dışı (key'ler boş)
- API Key: ✅ Gerekli (OpenRouter'dan al)
- Mesaj gönder: ✅ Çalışıyor

### ✅ Production Modu:
- CAPTCHA: ✅ Zorunlu (Turnstile key gerekli)
- API Key: ✅ Zorunlu
- Domain: ✅ Gerekli (hamzagpt.com)

---

## 📝 QUICK CHECKLIST

Test etmeden önce:
- [ ] `npm install` yaptım
- [ ] `.env.local` var (ADMIN_PASSWORD ve JWT_SECRET dolu)
- [ ] `npm run dev` çalışıyor
- [ ] http://localhost:3000 açılıyor
- [ ] Admin paneline girdim (`admin123`)
- [ ] OpenRouter API key ekledim
- [ ] Anasayfada mesaj yazabiliyorum

Hepsi ✅ ise sorunsuz çalışmalı!

---

## 🆘 HALA SORUN VAR MI?

### Console logları kontrol et:

```bash
# Terminal (npm run dev çalışırken)
# Hata mesajlarını kopyala

# Browser Console (F12)
# Kırmızı hataları kopyala
```

Bu bilgileri bana gönder, birlikte bakalım!

### Sık sorun: Port zaten kullanımda

```bash
# Port 3000 başka uygulama kullanıyorsa:
npm run dev -- -p 3001

# Sonra http://localhost:3001 aç
```

---

## 🎉 BAŞARILI!

Mesaj gönderebildiysen:
1. ✅ Development kurulumu tamam
2. ✅ API entegrasyonu çalışıyor
3. ✅ Chat sistemi hazır

Sonraki adım: **Deployment** (README.md'de detaylar var.)
