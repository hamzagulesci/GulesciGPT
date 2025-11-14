export default function Page() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-8" style={{ color: 'var(--text-secondary)' }}>
      <h1 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
        Gizlilik Bildirimi
      </h1>

      <section className="space-y-4 text-sm md:text-base leading-6 md:leading-7">
        <p><strong>ÖZET — Hemen bilmeniz gerekenler</strong></p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Sohbet geçmişleri <strong>sadece sizin tarayıcınızda</strong> saklanır; sunucuya kaydedilmez.</li>
          <li>Lütfen kimlik, banka, şifreler veya hukuki/finansal kararları doğrudan etkileyebilecek hassas bilgiler paylaşmayın.</li>
          <li>Yapay zekâ modelleri hata yapabilir; üretilen içerikler kesinlik taşımaz — önemli kararlar için doğrulama yapın.</li>
        </ul>
      </section>

      <hr className="my-6" style={{ borderColor: 'var(--border-color)' }} />

      <section className="space-y-4 text-sm md:text-base leading-6 md:leading-7">
        <h2 className="text-xl md:text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>GİZLİLİK & VERİ İŞLEME (AÇIK VE NET)</h2>

        <h3 className="text-lg md:text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>1. Nerede saklanır?</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Sohbet geçmişleri <strong>yalnızca tarayıcınızda</strong> (localStorage/IndexedDB vb.) saklanır. Sunucu tarafında kullanıcı sohbeti depolanmaz.</li>
          <li>Tarayıcı verilerinizi sildiğinizde sohbetler kalıcı şekilde yok olur; site bunları geri getiremez.</li>
        </ul>

        <h3 className="text-lg md:text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>2. Üçüncü taraf veri işleme (kısa, net)</h3>
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

        <h3 className="text-lg md:text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>4. Veri talepleri ve iletişim</h3>
        <p>Gizlilikle ilgili sorularınız veya veri talepleriniz (ör. içerik silme talebi) için: <a href="mailto:support@yourdomain.com" className="underline">support@yourdomain.com</a></p>
        <p>Sağlayıcı tarafındaki teknik kayıtlar elimizde olmayabilir; bu tip kayıtların silinmesi sağlayıcı prosedürlerine tabidir.</p>
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
