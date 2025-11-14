import Link from 'next/link'

export default function Page() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-8" style={{ color: 'var(--text-secondary)' }}>
      <div className="mb-4">
        <Link href="/" className="inline-flex items-center gap-2 text-sm" style={{ color: 'var(--text-tertiary)' }}>
          <span aria-hidden>←</span>
          <span>Ana sayfaya dön</span>
        </Link>
      </div>
      <h1 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
        Kullanım Koşulları
      </h1>

      <section className="space-y-4 text-sm md:text-base leading-6 md:leading-7">
        <p><strong>ÖZET — Hemen bilmeniz gerekenler</strong></p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Sohbet geçmişleri <strong>sadece sizin tarayıcınızda</strong> saklanır; sunucuya kaydedilmez.</li>
          <li>Lütfen kimlik, banka, şifreler veya hukuki/finansal kararları doğrudan etkileyebilecek hassas bilgiler paylaşmayın.</li>
          <li>Yapay zekâ modelleri hata yapabilir; üretilen içerikler kesinlik taşımaz — önemli kararlar için doğrulama yapın.</li>
          <li>Siteyi kullanarak bu koşulları ve gizlilik bildirimini kabul etmiş sayılırsınız.</li>
        </ul>
      </section>

      <hr className="my-6" style={{ borderColor: 'var(--border-color)' }} />

      <section className="space-y-4 text-sm md:text-base leading-6 md:leading-7">
        <h2 className="text-xl md:text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>KULLANIM KOŞULLARI (KULLANICI DOSTU)</h2>

        <h3 className="text-lg md:text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>1. Hizmetin amacı</h3>
        <p>Bu site, farklı yapay zekâ modellerine arayüz sağlayarak sohbet etmenizi sağlar. Site yalnızca arayüzdür; yanıtlar üçüncü taraf modeller/servisler tarafından üretilir.</p>

        <h3 className="text-lg md:text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>2. Doğruluk ve sorumluluk</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Model çıktılarının doğruluğu garanti edilmez. Çıktılara dayalı kararlar, işlemler veya maddi/hukuki sonuçlardan doğrudan siz sorumlusunuz.</li>
          <li>Modelin önerdiği eylemleri uygulamadan önce her zaman bağımsız doğrulama yapın.</li>
        </ul>

        <h3 className="text-lg md:text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>3. Uygun kullanım kuralları</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Hizmeti yasa dışı, zararlı, dolandırıcı veya başkalarına zarar verecek amaçlarla kullanmayın.</li>
          <li>Başkalarına ait özel veya kişisel bilgileri izinsiz paylaşmayın.</li>
          <li>Bot/spam/otomasyonla hizmeti zorlamayın; şüpheli davranış erişim kısıtına yol açar.</li>
        </ul>

        <h3 className="text-lg md:text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>4. Erişim, kesinti ve değişiklik hakkı</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Servis sağlayıcı kaynaklı kesinti, yoğunluk veya bakım nedeniyle hizmet geçici olarak kısıtlanabilir.</li>
          <li>Site operatörü, gerekçesiz olarak hizmeti değiştirme, sınırlandırma veya sonlandırma hakkını saklı tutar.</li>
        </ul>

        <h3 className="text-lg md:text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>5. Yaş uygunluğu</h3>
        <p>Site kayıt gerektirmediği için yaş doğrulaması yapılmaz; yasal sorumluluk kullanıcıya aittir. Rehberlik gerektiren durumlarda yetişkin gözetimi önerilir.</p>
      </section>

      <hr className="my-6" style={{ borderColor: 'var(--border-color)' }} />

      <section className="space-y-4 text-sm md:text-base leading-6 md:leading-7">
        <h2 className="text-xl md:text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>GİZLİLİK & VERİ İŞLEME (KISA, NET)</h2>

        <h3 className="text-lg md:text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>1. Nerede saklanır?</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Sohbet geçmişleri <strong>yalnızca tarayıcınızda</strong> (localStorage/IndexedDB vb.) saklanır. Sunucu tarafında kullanıcı sohbeti depolanmaz.</li>
          <li>Tarayıcı verilerinizi sildiğinizde sohbetler kalıcı şekilde yok olur; site bunları geri getiremez.</li>
        </ul>

        <h3 className="text-lg md:text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>2. Üçüncü taraf veri işleme</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Sohbet istekleri seçilen modele/sağlayıcıya iletilir. Bu sağlayıcılar teknik gerekçelerle bazı meta verileri (ör. istek zaman damgası, kullanılan model, token sayısı, ağ verileri veya IP adresi gibi) işleyebilir ve/veya saklayabilir.</li>
          <li>Bu veri işleme ve saklama süreçleri sağlayıcının kendi politikalarına tabidir; site operatörü bu üçüncü taraf işlemlerin tüm ayrıntılarını kontrol etmez.</li>
          <li>Özet: "Sunucuda saklamıyoruz" doğru; fakat model sağlayıcıları teknik log veya kayıt tutabilir — hassas veri paylaşmayın.</li>
        </ul>

        <h3 className="text-lg md:text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>3. Hassas veri uyarısı</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Kişisel kimlik numaraları, banka/kredi kartı bilgileri, şifreler ve benzeri hassas verileri yazmayın.</li>
          <li>Modelin verdiği öneriyle finansal, hukuki veya tıbbi işlem yapmayın; profesyonel danışmanlığa başvurun.</li>
        </ul>

        
      </section>

      <hr className="my-6" style={{ borderColor: 'var(--border-color)' }} />

      <section className="space-y-3 text-sm md:text-base leading-6 md:leading-7">
        <h2 className="text-xl md:text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>GÜVENLİK & SORUMLULUK REDDİ</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Yapay zekâlar hatalar yapabilir; yanlış veya yanıltıcı bilgi üretebilir.</li>
          <li>Site, modellerin içeriklerinden, sağlayıcıların veri uygulamalarından veya oluşabilecek doğrudan/indirekt zararlardan sorumlu tutulamaz.</li>
          <li>Kullanıcı, siteyi kullanırken ürettiği içerik ve gerçekleştirdiği eylemlerin sorumluluğunu üstlenir.</li>
        </ul>
      </section>
    </main>
  )
}
